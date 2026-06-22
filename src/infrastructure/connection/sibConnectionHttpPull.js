import EventEmitter from 'events'
import { sibConnectionEvents } from './sibConnectionEvents.js'
import { logger } from '../../logger.js'
import {
	SibRateLimitError,
	sibHttpClientGetQuickButtonCollectionsAsync,
	sibHttpClientGetRundownsWithoutItems,
	sibHttpClientGetSibInfo,
	sibHttpClientGetTeams,
} from './sibHttpClient.js'

/**
 * Abstraction to connect to SIB2 with HTTP pulling of sib api.
 */
export class SibConnectionHttpPull extends EventEmitter {
	isInitialized = false

	/**
	 * Connection properties to sib.
	 * @type {SibConnection}
	 */
	#sibConfig

	/**
	 * Pulling timer
	 * @type {NodeJS.Timer|NodeJS.Timeout|number}
	 */
	#pullTimer

	/**
	 * Previous db info.
	 * Compare and don't raise if same.
	 * @type {ApiMessageSibInfo}
	 */
	#prevSibInfo

	/**
	 * Previous qb collections.
	 * Compare and don't raise if same.
	 */
	#prevCollections

	/**
	 * Previous teams collections.
	 * Compare and don't raise if same.
	 */
	#prevTeams

	/**
	 * Previous rundowns.
	 * Compare and don't raise if same.
	 */
	#prevRundowns

	/**
	 * ComponentLastModified.Team timestamp at which teams were last SUCCESSFULLY fetched.
	 * Advanced only on a successful teams fetch, so a failed fetch (rate-limited or otherwise)
	 * keeps the old value and is retried on the next tick.
	 * @type {string|null}
	 */
	#fetchedTeamTimestamp

	/**
	 * ComponentLastModified.QuickButton timestamp at which quick button collections were
	 * last SUCCESSFULLY fetched. Advanced only on success; see {@link #fetchedTeamTimestamp}.
	 * @type {string|null}
	 */
	#fetchedQuickButtonTimestamp

	/**
	 * ComponentLastModified.Rundown timestamp at which rundowns were last SUCCESSFULLY fetched.
	 * Advanced only on success; see {@link #fetchedTeamTimestamp}.
	 * @type {string|null}
	 */
	#fetchedRundownTimestamp

	/**
	 * Unique ID that used to identify module in sib.
	 * Not currently used.
	 * @type {string}
	 */
	#deviceId

	/**
	 * Connect to WebSocket.
	 * Tries to reconnect if the connection fails (sib is not running).
	 * @param {SibConnection} config
	 */
	async connectToSib(config) {
		logger.debug('Connect start to %o', config)

		this.emit(sibConnectionEvents.OnSibConnecting)

		this.#sibConfig = config
		this.#deviceId = 'companion-module-iccms-sib'
		this.#prevSibInfo = null
		this.#prevTeams = null
		this.#prevCollections = null
		this.#prevRundowns = null
		this.#fetchedTeamTimestamp = null
		this.#fetchedQuickButtonTimestamp = null
		this.#fetchedRundownTimestamp = null

		clearTimeout(this.#pullTimer)
		this.#pullTimer = null

		// Set initialized before scheduling so an immediate first tick is allowed to
		// re-arm; #scheduleNextTick bails out once disconnect flips this back to false.
		this.isInitialized = true

		await this.#apiTimerTick()
		this.#scheduleNextTick()

		logger.debug('Connect done.')
	}

	/**
	 * Close connection to sib.
	 */
	disconnectFromSib() {
		logger.debug('Disconnect from sib.')

		this.isInitialized = false
		clearTimeout(this.#pullTimer)

		this.emit(sibConnectionEvents.OnSibDisconnected, '')
	}

	/**
	 * Schedule the next timer tick after the current one completes.
	 * Uses setTimeout to ensure ticks never overlap.
	 */
	#scheduleNextTick() {
		// A tick that was already in flight when disconnect cleared the timer would
		// otherwise re-arm it here, defeating disconnect and leaking the poll loop.
		if (!this.isInitialized) {
			return
		}

		this.#pullTimer = setTimeout(async () => {
			await this.#apiTimerTick()
			this.#scheduleNextTick()
		}, this.#sibConfig.pullIntervall)
	}

	/**
	 * Try to connect to sib and reconnect if fails.
	 */
	async #apiTimerTick() {
		logger.debug('Timer tick. Get data from sib api from %o.', this.#sibConfig.sibIp)

		if (!this.#sibConfig.isValid()) {
			logger.debug('Sib config is not valid.')
			this.emit(sibConnectionEvents.OnSibBadConfig, 'Enter SIB Ip in settings.')
			return
		}

		let sinInfo
		let currComponent

		try {
			sinInfo = await sibHttpClientGetSibInfo(this.#sibConfig.sibIpPort, this.#deviceId)

			currComponent = sinInfo && sinInfo.ComponentLastModified ? sinInfo.ComponentLastModified : null

			// The heartbeat just succeeded, so the connection is up. The heartbeat is the ONLY thing
			// that decides connection state. Report it here, NOT at the end of the tick, so a later
			// data-fetch failure (e.g. bad token) can mark the status failed without this success
			// overwriting it again — that overwrite was the ConnectionFailure → Ok flicker.
			this.emit(sibConnectionEvents.OnSibConnected)

			// Always emit db info changes if changed
			if (!(JSON.stringify(this.#prevSibInfo) === JSON.stringify(sinInfo))) {
				logger.debug('Connection. Db info updated. %o', sinInfo)

				this.emit(sibConnectionEvents.OnSibDatabaseChanges, sinInfo)
			}

			if (this.#sibConfig.disableDataFetch === true) {
				logger.debug('Data fetching disabled. Skipping heavy API calls.')
				this.#prevSibInfo = sinInfo
				return
			}

			// Decide which components to fetch by comparing the current ComponentLastModified
			// timestamps against the timestamp at which each component was last SUCCESSFULLY
			// fetched. With no current timestamps (legacy SIB) fetch all. Because each baseline
			// advances only on success, a failed fetch is retried on the next tick.
			const hasCurr = !!currComponent

			const shouldUpdateTeams = !hasCurr || currComponent.Team !== this.#fetchedTeamTimestamp
			const shouldUpdateQuickButtons = !hasCurr || currComponent.QuickButton !== this.#fetchedQuickButtonTimestamp
			const shouldUpdateRundowns = !hasCurr || currComponent.Rundown !== this.#fetchedRundownTimestamp

			logger.debug(
				'ComponentLastModified check — teams: %s, quickButtons: %s, rundowns: %s',
				shouldUpdateTeams
					? `changed (${this.#fetchedTeamTimestamp} → ${hasCurr ? currComponent.Team : '?'})`
					: 'unchanged',
				shouldUpdateQuickButtons
					? `changed (${this.#fetchedQuickButtonTimestamp} → ${hasCurr ? currComponent.QuickButton : '?'})`
					: 'unchanged',
				shouldUpdateRundowns
					? `changed (${this.#fetchedRundownTimestamp} → ${hasCurr ? currComponent.Rundown : '?'})`
					: 'unchanged',
			)

			// Teams
			if (shouldUpdateTeams) {
				try {
					const apiTeams = await sibHttpClientGetTeams(this.#sibConfig.sibIpPort, this.#sibConfig.token, this.#deviceId)

					if (!(JSON.stringify(this.#prevTeams) === JSON.stringify(apiTeams))) {
						logger.debug('Connection. Teams updated.')

						this.#prevTeams = apiTeams
						this.emit(sibConnectionEvents.OnSibTeamsUpdated, apiTeams)
					}

					// Teams fetched successfully — advance the baseline so we only re-fetch on the next change.
					if (hasCurr) this.#fetchedTeamTimestamp = currComponent.Team
				} catch (error) {
					if (error instanceof SibRateLimitError) {
						// 429 is benign — SIB is up, just throttling. Leave the connected status (set
						// right after the heartbeat) in place and skip the rest; we retry next tick.
						logger.warn('Rate limited by SIB on teams. Skipping remaining calls.')
						this.#prevSibInfo = sinInfo
						return
					}
					logger.error('Sib request for teams failed, %s', error)
					this.emit(sibConnectionEvents.OnSibError, 'Request to sib failed. Check password in settings.')
				}
			}

			// QuickButton Collections
			if (shouldUpdateQuickButtons) {
				try {
					const apiCollections = await sibHttpClientGetQuickButtonCollectionsAsync(
						this.#sibConfig.sibIpPort,
						this.#sibConfig.token,
						this.#deviceId,
					)

					if (!(JSON.stringify(this.#prevCollections) === JSON.stringify(apiCollections))) {
						logger.debug('Connection. Collections updated. Count: %d.', apiCollections ? apiCollections.length : 0)

						this.#prevCollections = apiCollections
						this.emit(sibConnectionEvents.OnSibQuickButtonsUpdated, apiCollections)
					}

					// Collections fetched successfully — advance the baseline so we only re-fetch on the next change.
					if (hasCurr) this.#fetchedQuickButtonTimestamp = currComponent.QuickButton
				} catch (error) {
					if (error instanceof SibRateLimitError) {
						logger.warn('Rate limited by SIB on collections. Skipping remaining calls.')
						this.#prevSibInfo = sinInfo
						return
					}
					logger.error('Sib request for collections failed, %s', error)
					this.emit(sibConnectionEvents.OnSibError, 'Request to sib failed. Check password in settings.')
				}
			}

			// Rundowns
			if (shouldUpdateRundowns) {
				try {
					const apiRundowns = await sibHttpClientGetRundownsWithoutItems(
						this.#sibConfig.sibIpPort,
						this.#sibConfig.token,
						this.#deviceId,
					)
					if (!(JSON.stringify(this.#prevRundowns) === JSON.stringify(apiRundowns))) {
						logger.debug('Connection. Rundowns updated.')

						this.#prevRundowns = apiRundowns
						this.emit(sibConnectionEvents.OnSibRundownUpdated, apiRundowns)
					}

					// Rundowns fetched successfully — advance the baseline so we only re-fetch on the next change.
					if (hasCurr) this.#fetchedRundownTimestamp = currComponent.Rundown
				} catch (error) {
					if (error instanceof SibRateLimitError) {
						logger.warn('Rate limited by SIB on rundowns. Skipping remaining calls.')
						this.#prevSibInfo = sinInfo
						return
					}
					logger.error('Sib request for rundowns failed, %s', error)
					this.emit(sibConnectionEvents.OnSibError, 'Request to sib failed. Check password in settings.')
				}
			}

			// Save latest SIB info for next tick. The connection status was already reported right
			// after the heartbeat — we deliberately do NOT re-emit OnSibConnected here, so any
			// data-fetch failure above remains the last status instead of being overwritten by Ok.
			this.#prevSibInfo = sinInfo

			logger.debug('Timer tick. Done.')
		} catch (error) {
			if (error instanceof SibRateLimitError) {
				// 429 means SIB answered — it's reachable, just throttling — so the connection is up.
				logger.warn('Rate limited by SIB on heartbeat. Waiting for next tick.')
				this.emit(sibConnectionEvents.OnSibConnected)
				return
			}
			// Only a heartbeat failure (no response / timeout) marks the connection as down.
			logger.debug('Sib request for info failed, %s.', error)
			this.emit(sibConnectionEvents.OnSibError, 'Connection to SIB failed. Check that SIB is running.')
			return
		}
	}
}
