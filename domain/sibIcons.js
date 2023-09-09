import { logger } from '../logger.js'
import { sibHttpClientGetPngIconBase64 } from '../infrastructure/connection/sibHttpClient.js'

/**
 * Used to store svg icons that are used by sib as dictionary locally.
 * To skip converting every time.
 */
export class SibIcons {
	/**
	 * Info about current database.
	 * key is icon name, value is png icon as base64.
	 * @type { Map }
	 */
	#icons

	/**
	 * SIB version where icons api was added.
	 * @type {string}
	 */
	#sibVersionWithIconApi = '2.15.8630'

	constructor() {
		this.#icons = new Map()
	}

	/**
	 * Takes api object, extracts icons.
	 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} apiButtons all collections with groups and buttons.
	 * @param {SibConnection} connectionCfg
	 * @param {string} sibVersion
	 * @returns {Promise<void>}
	 */
	async updateIcons(apiButtons, connectionCfg, sibVersion) {
		if (typeof connectionCfg == 'undefined') {
			logger.warn('Icons, null connection string.')
		}

		if (typeof apiButtons == 'undefined') {
			this.#icons.clear()
		}

		if (sibVersion.startsWith(this.#sibVersionWithIconApi)) {
			logger.debug(
				'ICONS. Sib needs to be update to get icons: %s. Version with icons was released Aug 2023.',
				sibVersion
			)
			return
		}

		logger.debug('ICONS. Update icons. Known keys: %o.', this.#icons.keys())

		// Collect all unique icon names.
		let uniqueSvgIcons = []

		apiButtons.forEach((iCol) => {
			if (!uniqueSvgIcons.includes(iCol.IconId)) {
				uniqueSvgIcons.push(iCol.IconId)
			}

			iCol.Groups.forEach((iGroup) => {
				if (!uniqueSvgIcons.includes(iGroup.IconId)) {
					uniqueSvgIcons.push(iGroup.IconId)
				}

				iGroup.Buttons.forEach((iButton) => {
					if (!uniqueSvgIcons.includes(iButton.IconId)) {
						uniqueSvgIcons.push(iButton.IconId)
					}
				})
			})
		})

		// Keys
		const uniqueIconIds = uniqueSvgIcons
		const knowsIds = Array.from(this.#icons.keys())

		const newIconIds = uniqueIconIds.filter((value) => !knowsIds.includes(value))

		logger.debug('ICONS. Unique icons in request: %o.', uniqueSvgIcons)
		logger.debug('ICONS. New icons to fetch: %o.', newIconIds)

		// Process values.
		let convertedIcons = await Promise.all(
			newIconIds.map(async (iconId) => {
				try {
					const base64png = await sibHttpClientGetPngIconBase64(connectionCfg.sibIpPort, connectionCfg.token, iconId)

					if (base64png !== '') {
						return { iconId: iconId, png64: base64png }
					} else {
						// Handle conversion errors and incompatible sib api.
						return null
					}
				} catch (error) {
					return null
				}
			})
		)

		let fetchedIconIds = convertedIcons.filter((x) => x).map((a) => a['iconId'])

		logger.debug('ICONS. Got new icon id: %o', fetchedIconIds)

		// Save conversion fetchedIconIds locally.
		convertedIcons.forEach((iconKvp) => {
			try {
				if (iconKvp) {
					// extra check for exceptions
					const iconId = iconKvp['iconId']
					const base64Png = iconKvp['png64']

					logger.debug('ICONS, add: %s', iconId)

					if (!this.#icons.has(iconId)) {
						this.#icons.set(iconId, base64Png)
					}
				}
			} catch (error) {
				logger.warn(JSON.stringify(iconKvp))
			}
		})

		logger.debug('ICONS. Icons after update: %o.', Array.from(this.#icons.keys()))
	}

	/**
	 * Check if icon is in local cache.
	 * @param {string} iconId
	 */
	hasIcon(iconId) {
		return this.#icons.has(iconId)
	}

	/**
	 * Get base64 png icon by icon id.
	 * @param  {string} iconId
	 * @returns {string} base64 encoded png icon or empty string.
	 */
	getIconPngBase64(iconId) {
		if (this.#icons.has(iconId)) {
			logger.debug('Icons. Got icon: %s', iconId)
			return this.#icons.get(iconId)
		}

		logger.debug('Icons. Missing icon: %s', iconId)
		return ''
	}
}
