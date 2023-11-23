import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { upgradeScripts } from './application/upgrade.js'
import { logger } from './logger.js'
import { configFieldId } from './application/configFieldId.js'
import { SibConnection } from './infrastructure/connection/sibConnection.js'
import { SibComputer } from './domain/sibComputer.js'
import { SibIcons } from './domain/sibIcons.js'
import { SibConnectionHttpPull } from './infrastructure/connection/sibConnectionHttpPull.js'
import { updateVariableDefinitions } from './application/variables.js'
import { updateFeedbacks } from './application/updateFeedbacks.js'
import { sibConnectionEvents } from './infrastructure/connection/sibConnectionEvents.js'
import { controllerQuickButtonCollections } from './application/controllers/controllerQuickButtonCollections.js'
import { SibWebSocket } from './infrastructure/connection/sibWebSocket.js'
import { updateActionsAtStartup } from './application/actions.js'
import { sibHttpClientChangeTeamById } from './infrastructure/connection/sibHttpClient.js'

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
	 * Open sib database via WebSocket.
	 * @type {SibWebSocket}
	 */
	#sibSocket = undefined

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

			if (sibDebug) {
				logger.level = 'debug'
			} else {
				logger.level = 'error'
			}

			this.#sibConfig = new SibConnection(sibHost, sibPort, sibPass, sibReconnect, sibDebug, sibReset, sibToken)

			this.#sibComputer = new SibComputer()
			this.#sibIcons = new SibIcons()

			this.#sibConnection = new SibConnectionHttpPull()
			this.#sibSocket = new SibWebSocket(this.#sibConfig)

			this.#sibComputer.setConnectionConfig(this.#sibConfig)
			await this.#sibConnection.connectToSib(this.#sibConfig)

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

			this.#sibConnection.on(sibConnectionEvents.OnSibQuickButtonsUpdated, async (value) => {
				logger.debug(`Got connected data.`)

				// BUG: get all teams.
				let allTeams

				await controllerQuickButtonCollections(
					this.#sibComputer,
					this.#sibIcons,
					value,
					this,
					this.#sibSocket,
					allTeams
				)
			})

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
		this.#sibSocket = undefined
		this.#sibConnection.disconnectFromSib()
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

		if (sibDebug) {
			logger.level = 'debug'
		} else {
			logger.level = 'error'
		}

		this.#sibConfig = new SibConnection(sibHost, sibPort, sibPass, sibReconnect, sibDebug, sibReset, sibToken)

		this.#sibComputer.setConnectionConfig(this.#sibConfig)
		await this.#sibConnection.connectToSib(this.#sibConfig)
	}

	/**
	 * The module configuration is like preferences for the connection. E.g. the IP-address of the device controlled by the instance.
	 * Companion will call this when the configuration panel is opened for your module, so that it can present the correct fields to the user.
	 *
	 * The fields you can use here are similar to the ones for actions and feedbacks, but with more limitation.
	 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/Module-configuration">Module configuration</a>
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
		]
	}
}

runEntrypoint(SibPluginInstance, upgradeScripts)
