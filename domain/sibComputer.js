import { ApiMessageSibInfo } from '../infrastructure/protocol/apiMessageSibInfo.js'
import { logger } from '../logger.js'

/**
 * Stores sib data and manages state.
 */
export class SibComputer {
	/**
	 * Info about current database.
	 * @type { ApiMessageSibInfo }
	 */
	#sibInfo = undefined

	/**
	 * Parsed and corrected collections from sib instance.
	 * @type {apiQuickButtonCollectionWithGroupsAndButtons[]}
	 */
	#sibCollections = undefined

	/**
	 * Connection properties to sib.
	 * @type {SibConnection}
	 */
	#sibConnectionConfig = undefined

	constructor() {
		this.#sibInfo = new ApiMessageSibInfo()
		this.#sibCollections = []
	}

	/**
	 * Set db info from network.
	 * @param {ApiMessageSibInfo} parsedInfo
	 */
	setSibInfo(parsedInfo) {
		if (typeof parsedInfo == 'undefined') {
			logger.warn('CMP. parsedInfo is undefined.')
			return
		}

		logger.debug('CMP. setSibInfo: %o', parsedInfo)

		this.#sibInfo = parsedInfo
	}

	/**
	 * Update connection config.
	 * @param {SibConnection} cfg
	 */
	setConnectionConfig(cfg) {
		if (typeof cfg == 'undefined') {
			logger.warn('CMP. cfg is undefined.')
			return
		}
		logger.debug('CMP. Updated config: %o.', cfg)

		this.#sibConnectionConfig = cfg
	}

	/**
	 * Get connection config.
	 * @return {SibConnection} cfg
	 */
	getConnectionConfig() {
		return this.#sibConnectionConfig
	}

	/**
	 * Get sib version.
	 * @returns {string}
	 */
	getSibVersion() {
		let sibVer
		if (this.#sibInfo.SportInTheBoxVersion === undefined) {
			sibVer = ''
		} else if (this.#sibInfo.SportInTheBoxVersion === null) {
			sibVer = ''
		} else if (this.#sibInfo.SportInTheBoxVersion.trim() === '') {
			sibVer = ''
		} else if (this.#sibInfo.SportInTheBoxVersion.length === 0) {
			sibVer = ''
		} else {
			sibVer = this.#sibInfo.SportInTheBoxVersion
		}
		return sibVer
	}

	/**
	 * Set db info from network.
	 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} parsedCollections
	 */
	setSibCollections(parsedCollections) {
		if (typeof parsedCollections == 'undefined') {
			this.#sibCollections = []
			logger.warn('CMP. Collection is undefined.')
			return
		}

		if (!Array.isArray(parsedCollections) || !parsedCollections.length) {
			this.#sibCollections = []
			logger.warn('CMP. Collection is not array.')
			return
		}

		this.#sibCollections = parsedCollections
	}

	/**
	 * Get collections with buttons.
	 * Only those can be used to create presets.
	 * @returns {apiQuickButtonCollectionWithGroupsAndButtons[]}
	 */
	getCollectionsWithButtons() {
		let colForPresets = []

		if (!colForPresets) return colForPresets

		if (!Array.isArray(this.#sibCollections) || !this.#sibCollections.length) {
			return []
		}

		this.#sibCollections.forEach((eCollection) => {
			try {
				if (eCollection.hasButtons()) {
					colForPresets.push(eCollection)
				}
			} catch (e) {
				logger.error('CMP. Get collections loop, %s.', e)
			}
		})
		return colForPresets
	}

	/**
	 * Get api url (ip:port)
	 * @returns {string}
	 */
	getApiUrl() {
		return this.#sibConnectionConfig.sibIpPort
	}
}
