import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { upgradeScripts } from './application/upgrade.js'
import { logger } from './logger.js'
import { configFieldId } from './application/configFieldId.js'
import { SibConnection } from './infrastructure/connection/sibConnection.js'
import { SibComputer } from './domain/sibComputer.js'
import { SibIcons } from './domain/sibIcons.js'
import { TeamLogos } from './domain/teamLogos.js'
import { SibConnectionHttpPull } from './infrastructure/connection/sibConnectionHttpPull.js'
import { updateVariableDefinitions } from './application/variables.js'
import { updateFeedbacks } from './application/updateFeedbacks.js'
import { sibConnectionEvents } from './infrastructure/connection/sibConnectionEvents.js'
import { syncSibDataToCompanion } from './application/controllers/syncSibDataToCompanion.js'
import { SibWebSocket } from './infrastructure/connection/sibWebSocket.js'
import { updateActionsAtStartup } from './application/actions.js'
import { sibHttpClientChangeTeamById } from './infrastructure/connection/sibHttpClient.js'
import { parseCollectionWithGroupsAndButtonsArray } from './infrastructure/parsers/parseCollectionWithGroupsAndButtonsArray.js'

/**
 * When your module is started, first the constructor will be called, followed by your upgrade scripts and then the init method.
 * Your constructor should only do some minimal class setup.
 * It does not have access to your instance config, so cannot be used to start doing things.
 */
class SibPluginInstance extends InstanceBase {
	isInitialized = false

	/**
	 * Connection properties to sib.
	 * @type {SibConnection}
	 */
	#sibConfig = undefined

	/**
	 * Connection layer to sib.
	 * Change that class to change to other carrier.
	 * @type {SibConnectionHttpPull}
	 */
	#sibConnection = undefined

	/**
	 * Holds all data from network and manages state.
	 * @type {SibComputer}
	 */
	#sibComputer = undefined

	/**
	 * Holds all icons as name and converted value.
	 * @type {SibIcons}
	 */
	#sibIcons = undefined

	/**
	 * Holds team logos cache keyed by team OID.
	 * @type {TeamLogos}
	 */
	#teamLogos = undefined

	/**
	 * Open sib database via WebSocket.
	 * @type {SibWebSocket}
	 */
	#sibSocket = undefined

	/**
	 * Timer for retrying incomplete icon fetches after rate limiting.
	 * @type {NodeJS.Timeout|undefined}
	 */
	#iconRetryTimer = undefined

	/**
	 * Number of icon retry attempts since last data change.
	 * @type {number}
	 */
	#iconRetryCount = 0

	/**
	 * Maximum number of icon retry attempts before giving up.
	 * @type {number}
	 */
	#maxIconRetries = 3

	// noinspection JSCheckFunctionSignatures
	/**
	 * Inside the init method you should set up the connection to your device and get everything working ready for actions and feedbacks to start being used.
	 * @param {*} config
	 */
	async init(config) {
		try {
			this.config = config

			const sibHost = config[configFieldId.SibIpHost]
			const sibPort = config[configFieldId.SibPort]
			const sibPass = config[configFieldId.SibPass]
			const sibToken = config[configFieldId.SibHelperPass]
			const sibReconnect = config[configFieldId.Reconnect]
			const sibDebug = config[configFieldId.DebugMessages]
			const sibReset = config[configFieldId.ResetVariables]
			const sibDisableDataFetch = config[configFieldId.DisableDataFetch]

			if (sibDebug) {
				logger.level = 'debug'
			} else {
				logger.level = 'error'
			}

			this.#sibConfig = new SibConnection(sibHost, sibPort, sibPass, sibReconnect, sibDebug, sibReset, sibToken, sibDisableDataFetch)

			this.#sibComputer = new SibComputer()
			this.#sibIcons = new SibIcons()
			this.#teamLogos = new TeamLogos()

			this.#sibConnection = new SibConnectionHttpPull()
			this.#sibSocket = new SibWebSocket(this.#sibConfig)

			this.#sibComputer.setConnectionConfig(this.#sibConfig)

			// Hardcoded thins.
			updateActionsAtStartup(this, this.#sibSocket, this.#sibConfig, sibHttpClientChangeTeamById)
			updateVariableDefinitions(this)
			updateFeedbacks(this, this.#sibComputer)

			// Connection states
			this.#sibConnection.on(sibConnectionEvents.OnSibBadConfig, (msg) => {
				logger.warn(msg)
				this.updateStatus(InstanceStatus.BadConfig, msg)
			})

			this.#sibConnection.on(sibConnectionEvents.OnSibConnecting, () => {
				logger.debug(`Connecting.`)
				this.updateStatus(InstanceStatus.Connecting)
			})

			this.#sibConnection.on(sibConnectionEvents.OnSibConnected, () => {
				logger.debug(`Connected.`)
				this.updateStatus(InstanceStatus.Ok)
			})

			this.#sibConnection.on(sibConnectionEvents.OnSibDisconnected, (msg) => {
				logger.debug(`disconnected.`)
				this.updateStatus(InstanceStatus.Disconnected, msg)
			})

			this.#sibConnection.on(sibConnectionEvents.OnSibError, (msg) => {
				logger.warn(msg)
				this.updateStatus(InstanceStatus.ConnectionFailure, msg)
			})

			// General exception. Don't crash rest.
			this.#sibConnection.on('error', (err) => {
				logger.error(err)
			})

			// Data updates.
			this.#sibConnection.on(sibConnectionEvents.OnSibDatabaseChanges, (value) => {
				logger.debug(`Got connected data.`)
				this.#sibComputer.setSibInfo(value)
			})

			this.#sibConnection.on(sibConnectionEvents.OnSibRundownUpdated, async (value) => {
				logger.debug(`Got rundown data.`)
				this.#resetIconRetry()
				this.#sibComputer.setSibRundowns(value)

				let allTeams = this.#sibComputer.getSibTeams()
				let allRundowns = this.#sibComputer.getSibRundowns()
				let qbCollections = this.#sibComputer.getCollectionsWithButtons()

				const iconsComplete = await syncSibDataToCompanion(
					this.#sibComputer,
					this.#sibIcons,
					this.#teamLogos,
					qbCollections,
					this,
					this.#sibSocket,
					allTeams,
					allRundowns
				)

				this.#handleSyncResult(iconsComplete)
			})

			this.#sibConnection.on(sibConnectionEvents.OnSibTeamsUpdated, async (value) => {
				logger.debug(`Got teams data.`)
				this.#resetIconRetry()
				this.#sibComputer.setSibTeams(value)

				let allTeams = this.#sibComputer.getSibTeams()
				let allRundowns = this.#sibComputer.getSibRundowns()
				let qbCollections = this.#sibComputer.getCollectionsWithButtons()

				const iconsComplete = await syncSibDataToCompanion(
					this.#sibComputer,
					this.#sibIcons,
					this.#teamLogos,
					qbCollections,
					this,
					this.#sibSocket,
					allTeams,
					allRundowns
				)

				this.#handleSyncResult(iconsComplete)
			})

			this.#sibConnection.on(sibConnectionEvents.OnSibQuickButtonsUpdated, async (value) => {
				logger.debug(`Got QuickButtons data.`)
				this.#resetIconRetry()

				const qbCollections = parseCollectionWithGroupsAndButtonsArray(value)
				this.#sibComputer.setSibCollections(qbCollections)

				let allTeams = this.#sibComputer.getSibTeams()
				let allRundowns = this.#sibComputer.getSibRundowns()

				const iconsComplete = await syncSibDataToCompanion(
					this.#sibComputer,
					this.#sibIcons,
					this.#teamLogos,
					qbCollections,
					this,
					this.#sibSocket,
					allTeams,
					allRundowns
				)

				this.#handleSyncResult(iconsComplete)
			})

			// Connect after listeners are registered so the first tick's events are handled.
			await this.#sibConnection.connectToSib(this.#sibConfig)

			this.isInitialized = true

			this.log('debug', `init. Done.`)
		} catch (e) {
			logger.error(e, 'init failed.')
		}
	}

	/**
	 * When the module gets deleted or disabled the destroy function is called. here you should clean up whatever you don't need anymore.
	 * Make sure to not leave timers running, as that can cause performance problems in companion as the leaked timers start piling up!
	 */
	async destroy() {
		this.isInitialized = false
		clearTimeout(this.#iconRetryTimer)
		this.#sibSocket = undefined
		this.#sibConnection.disconnectFromSib()
	}

	/**
	 * Handles sync result and schedules icon retry if needed.
	 * @param {boolean} iconsComplete - true if all icons fetched, false if rate limited.
	 */
	#handleSyncResult(iconsComplete) {
		if (iconsComplete) {
			return
		}

		if (this.#iconRetryCount >= this.#maxIconRetries) {
			logger.warn('Icon retry limit reached (%d). Remaining icons will load on next data change.', this.#maxIconRetries)
			return
		}

		this.#iconRetryCount++
		logger.debug('Scheduling icon retry %d/%d.', this.#iconRetryCount, this.#maxIconRetries)

		this.#iconRetryTimer = setTimeout(async () => {
			let allTeams = this.#sibComputer.getSibTeams()
			let allRundowns = this.#sibComputer.getSibRundowns()
			let qbCollections = this.#sibComputer.getCollectionsWithButtons()

			const complete = await syncSibDataToCompanion(
				this.#sibComputer,
				this.#sibIcons,
				this.#teamLogos,
				qbCollections,
				this,
				this.#sibSocket,
				allTeams,
				allRundowns
			)

			this.#handleSyncResult(complete)
		}, this.#sibConfig.pullIntervall)
	}

	/**
	 * Cancels pending icon retry and resets retry counter.
	 * Called when fresh data arrives from SIB.
	 */
	#resetIconRetry() {
		clearTimeout(this.#iconRetryTimer)
		this.#iconRetryCount = 0
	}

	/**
	 * Process an updated configuration array.
	 * @param config
	 * @returns {Promise<void>}
	 */
	async configUpdated(config) {
		this.log('debug', `configUpdated.`)

		this.config = config

		const sibHost = config[configFieldId.SibIpHost]
		const sibPort = config[configFieldId.SibPort]
		const sibPass = config[configFieldId.SibPass]
		const sibToken = config[configFieldId.SibHelperPass]
		const sibReconnect = config[configFieldId.Reconnect]
		const sibDebug = config[configFieldId.DebugMessages]
		const sibReset = config[configFieldId.ResetVariables]
		const sibDisableDataFetch = config[configFieldId.DisableDataFetch]

		if (sibDebug) {
			logger.level = 'debug'
		} else {
			logger.level = 'error'
		}

		this.#sibConfig = new SibConnection(sibHost, sibPort, sibPass, sibReconnect, sibDebug, sibReset, sibToken, sibDisableDataFetch)

		this.#sibComputer.setConnectionConfig(this.#sibConfig)
		await this.#sibConnection.connectToSib(this.#sibConfig)
	}

	/**
	 * The module configuration is like preferences for the connection. E.g. the IP-address of the device controlled by the instance.
	 * Companion will call this when the configuration panel is opened for your module, so that it can present the correct fields to the user.
	 *
	 * The fields you can use here are similar to the ones for actions and feedbacks, but with more limitation.
	 * @see <a href="https://companion.free/for-developers/module-development/connection-basics/user-configuration/">Module configuration</a>
	 * @returns {any[]}
	 */
	getConfigFields() {
		logger.debug('Getting config fields.')

		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will allow you to control the Sport In The Box v2.16.',
			},
			{
				type: 'textinput',
				id: configFieldId.SibIpHost,
				label: 'Sport In The Box api host. If multiple instances are used, each instance must be added separately.',
				tooltip: 'localhost or 127.0.0.1',
				default: 'localhost',
				width: 12,
			},
			{
				type: 'textinput',
				id: configFieldId.SibPort,
				label: 'Sport In The Box api port',
				tooltip: 'Default is 8080',
				width: 4,
				default: 8080,
				regex: Regex.PORT,
				isVisible: () => false,
			},
			{
				type: 'textinput',
				id: configFieldId.SibPass,
				label: 'API Password',
				tooltip: 'Same password as in General settings - API',
				width: 16,
			},
			{
				type: 'textinput',
				id: configFieldId.SibHelperPass,
				label: 'Helper Password',
				tooltip: 'Password from service helper in tray menu.',
				width: 16,
			},
			{
				type: 'checkbox',
				id: configFieldId.Reconnect, // placeholder.
				isVisible: () => false,
				label: 'Reconnect',
				tooltip: 'Reconnect on error',
				width: 6,
				default: true,
			},
			{
				type: 'checkbox',
				id: configFieldId.DebugMessages,
				label: 'Debug messages',
				tooltip: 'Log incoming and outgoing messages',
				width: 6,
				default: false,
			},
			{
				type: 'checkbox',
				id: configFieldId.ResetVariables,
				isVisible: () => false,
				label: 'Reset variables',
				tooltip: 'Reset variables on init and on connect',
				width: 6,
				default: false,
			},
			{
				type: 'checkbox',
				id: configFieldId.DisableDataFetch,
				label: 'Disable data fetching',
				tooltip: 'Only fetch heartbeat and database info. Disables teams, quick buttons, and rundowns polling.',
				width: 6,
				default: false,
			},
		]
	}
}

runEntrypoint(SibPluginInstance, upgradeScripts)
