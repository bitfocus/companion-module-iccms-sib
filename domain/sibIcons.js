import {logger} from '../logger.js'
import {sibHttpClientGetPngIconBase64, SibRateLimitError} from '../infrastructure/connection/sibHttpClient.js'

/**
 * Used to store svg icons that are used by sib as dictionary locally.
 * To skip converting every time.
 */
export class SibIcons {
  /**
   * Info about the current database.
   * key is icon name, value is png icon as base64.
   * @type { Map }
   */
  #icons

  /**
   * SIB version where icons api was added.
   * @type {string}
   */
  #sibVersionWithIconApi = '2.15.8630'

  /**
   * Unique ID that used to identify module in sib.
   * Not currently used.
   * @type {string}
   */
  #deviceId

  constructor() {
    this.#icons = new Map()
    this.#deviceId = "companion-module-iccms-sib"
  }

  /**
   * Number of currently cached icons.
   * @returns {number}
   */
  get cachedCount() {
    return this.#icons.size
  }

  /**
   * Updates icons by fetching and caching all icons in the provided iconIds set/array.
   * @param {Iterable<string>} iconIds - Set or array of unique icon IDs to fetch.
   * @param {SibConnection} connectionCfg
   * @param {string} sibVersion
   * @returns {Promise<boolean>} true if all icons fetched, false if interrupted by rate limit (429).
   */
  async updateIcons(iconIds, connectionCfg, sibVersion) {
    if (typeof connectionCfg == 'undefined') {
      logger.warn('Icons, null connection string.')
      return true
    }

    if (typeof iconIds == 'undefined') {
      this.#icons.clear()
      return true
    }

    if (sibVersion.startsWith(this.#sibVersionWithIconApi)) {
      logger.debug(
        'ICONS. Sib needs to be update to get icons: %s. Version with icons was released Aug 2023.',
        sibVersion
      )
      return true
    }

    logger.debug('ICONS. Update icons. Known keys: %o.', Array.from(this.#icons.keys()))

    // Prepare icon ID lists
    const allIconIds = Array.from(iconIds || [])
    const knownIds = Array.from(this.#icons.keys())
    const newIconIds = allIconIds.filter((value) => !knownIds.includes(value))

    logger.debug('ICONS. Unique icons in request: %o.', allIconIds)
    logger.debug('ICONS. New icons to fetch: %o.', newIconIds)

    let convertedIcons = []
    let rateLimited = false

    // Fetch new icons sequentially
    for (const iconId of newIconIds) {
      try {
        const base64png = await sibHttpClientGetPngIconBase64(connectionCfg.sibIpPort, connectionCfg.token, iconId, this.#deviceId)
        if (base64png !== '') {
          convertedIcons.push({iconId, png64: base64png})
        }
      } catch (error) {
        if (error instanceof SibRateLimitError) {
          logger.warn('ICONS. Rate limited by SIB. Stopping icon fetch, will retry later.')
          rateLimited = true
          break
        }
      }
    }

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

    return !rateLimited
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
      logger.debug('Icons. Get icon: %s', iconId)
      return this.#icons.get(iconId)
    }

    logger.debug('Icons. Missing icon: %s', iconId)
    return ''
  }

  /**
   * Fetch a single icon by iconId from the remote source if not cached.
   * @param {string} iconId
   * @param {SibConnection} connectionCfg - Should have sibIpPort and token properties.
   * @returns {Promise<string>} base64 encoded png icon or empty string.
   */
  async fetchIconById(iconId, connectionCfg) {
    if (this.#icons.has(iconId)) {
      logger.debug('Icons. fetchIconById: cache hit for %s', iconId)
      return this.#icons.get(iconId)
    }
    try {
      const base64png = await sibHttpClientGetPngIconBase64(
        connectionCfg.sibIpPort,
        connectionCfg.token,
        iconId,
        this.#deviceId
      )
      if (base64png !== '') {
        this.#icons.set(iconId, base64png)
        logger.debug('Icons. fetchIconById: fetched and cached %s', iconId)
        return base64png
      } else {
        logger.debug('Icons. fetchIconById: icon not found or empty for %s', iconId)
        return ''
      }
    } catch (error) {
      if (error instanceof SibRateLimitError) {
        logger.warn(`Icons. fetchIconById: rate limited by SIB for icon ${iconId}`)
      } else {
        logger.warn(`Icons. fetchIconById: error fetching icon ${iconId}: ${error}`)
      }
      return ''
    }
  }
}
