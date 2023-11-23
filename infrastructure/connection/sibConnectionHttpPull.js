import EventEmitter from 'events'
import { sibConnectionEvents } from './sibConnectionEvents.js'
import { logger } from '../../logger.js'
import {
	sibHttpClientGetQuickButtonCollectionsAsync,
	sibHttpClientGetSibInfoAsync,
	sibHttpClientGetTeamsAsync,
} from './sibHttpClient.js'
import { parseApiMessageSibInfo } from '../acl/parseApiMessageSibInfo.js'

// https://nodejs.dev/en/api/v18/events/
// https://nodejs.dev/en/learn/the-nodejs-event-emitter/
// https://borzecki.github.io/blog/jest-event-emitters/
// https://stackoverflow.com/questions/8898399/node-js-inheriting-from-eventemitter?rq=3

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
	 * Connect to WebSocket.
	 * Tries to reconnect if connection fails (sib is not running).
	 * @param {SibConnection} config
	 */
	async connectToSib(config) {
		logger.debug('Connect start to %o', config)

		this.emit(sibConnectionEvents.OnSibConnecting)

		this.#sibConfig = config

		// Will time out gui sometimes. Make first call not to wait for timer.
		setImmediate(async () => {
			await this.#apiTimerTick()
		})

		clearInterval(this.#pullTimer)
		this.#pullTimer = null

		this.#pullTimer = setInterval(async () => {
			await this.#apiTimerTick()
		}, this.#sibConfig.pullIntervall)

		this.emit(sibConnectionEvents.OnSibConnected)

		this.isInitialized = true

		logger.debug('Connect done.')
	}

	/**
	 * Close connection to sib.
	 */
	disconnectFromSib() {
		logger.debug('Disconnect from sib.')

		this.isInitialized = false
		clearInterval(this.#pullTimer)

		this.emit(sibConnectionEvents.OnSibDisconnected, '')
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

		try {
			sinInfo = await sibHttpClientGetSibInfoAsync(this.#sibConfig.sibIpPort)

			if (!(JSON.stringify(this.#prevSibInfo) === JSON.stringify(sinInfo))) {
				logger.debug('Connection. Db info updated. %o', sinInfo)

				// TODO: check why parsing fails
				let x = parseApiMessageSibInfo(sinInfo)

				this.#prevSibInfo = sinInfo
				this.emit(sibConnectionEvents.OnSibDatabaseChanges, sinInfo)
			}
		} catch (error) {
			logger.debug('Sib request for info failed, %s.', error)
			this.emit(sibConnectionEvents.OnSibError, 'Connection to SIB failed. Check that SIB is running.')
			return
		}

		// Teams
		try {
			const apiTeams = await sibHttpClientGetTeamsAsync(this.#sibConfig.sibIpPort, this.#sibConfig.token)

			if (!(JSON.stringify(this.#prevTeams) === JSON.stringify(apiTeams))) {
				logger.debug('Connection. Teams updated.')

				this.#prevTeams = apiTeams
				this.emit(sibConnectionEvents.OnSibTeamsUpdated, apiTeams)
			}
		} catch (error) {
			logger.error('Sib request for teams failed, %s', error)
			this.emit(sibConnectionEvents.OnSibError, 'Request to sib failed. Check password in settings.')
		}

		// qb collections.
		try {
			const apiCollections = await sibHttpClientGetQuickButtonCollectionsAsync(
				this.#sibConfig.sibIpPort,
				this.#sibConfig.token
			)

			if (!(JSON.stringify(this.#prevCollections) === JSON.stringify(apiCollections))) {
				logger.debug('Connection. Collections updated.')

				this.#prevCollections = apiCollections
				this.emit(sibConnectionEvents.OnSibQuickButtonsUpdated, apiCollections)
			}
		} catch (error) {
			logger.error('Sib request for collections failed, %s', error)
			this.emit(sibConnectionEvents.OnSibError, 'Request to sib failed. Check password in settings.')
		}

		this.emit(sibConnectionEvents.OnSibConnected)

		logger.debug('Timer tick. Done.')
	}
}
