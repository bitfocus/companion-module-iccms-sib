import {logger} from '../logger.js'
import {sibHttpClientGetTeamLogo} from '../infrastructure/connection/sibHttpClient.js'

/**
 * Used to store team logos that sib uses as dictionary locally.
 * To skip converting every time.
 */
export class TeamLogos {
  /**
   * Info about team logos.
   * key is teamId, value is png logo as base64.
   * @type { Map }
   */
  #logos

  /**
   * SIB version where team logos api were added.
   * @type {string}
   */
  #sibVersionWithTeamLogosApi = '2.15.8630'

  /**
   * Unique ID that used to identify module in sib.
   * Not currently used.
   * @type {string}
   */
  #deviceId

  constructor() {
    this.#logos = new Map()
    this.#deviceId = "companion-module-iccms-sib"
  }

  /**
   * Updates team logos by fetching and caching all logos for the provided teamIds set/array.
   * @param {Iterable<number>} teamIds - Set or array of unique team IDs to fetch.
   * @param {SibConnection} connectionCfg
   * @param {string} sibVersion
   * @returns {Promise<void>}
   */
  async updateTeamLogos(teamIds, connectionCfg, sibVersion) {
    if (typeof connectionCfg == 'undefined') {
      logger.warn('TeamLogos, null connection string.')
      return
    }

    if (typeof teamIds == 'undefined') {
      this.#logos.clear()
      return
    }

    if (sibVersion.startsWith(this.#sibVersionWithTeamLogosApi)) {
      logger.debug(
        'TEAM LOGOS. Sib needs to be update to get team logos: %s. Version with team logos was released Aug 2023.',
        sibVersion
      )
      return
    }

    logger.debug('TEAM LOGOS. Update team logos. Known keys: %o.', Array.from(this.#logos.keys()))

    // Prepare team ID lists
    const allTeamIds = Array.from(teamIds || [])
    const knownIds = Array.from(this.#logos.keys())
    const newTeamIds = allTeamIds.filter((value) => !knownIds.includes(value))

    logger.debug('TEAM LOGOS. Unique team IDs in request: %o.', allTeamIds)
    logger.debug('TEAM LOGOS. New team logos to fetch: %o.', newTeamIds)

    let convertedLogos = []

    // Fetch new team logos sequentially
    for (const teamId of newTeamIds) {
      try {
        const teamLogo = await sibHttpClientGetTeamLogo(connectionCfg.sibIpPort, teamId, connectionCfg.token, this.#deviceId)
        if (teamLogo && teamLogo.logoBase64 !== '') {
          convertedLogos.push({teamId, png64: teamLogo.logoBase64})
        }
      } catch (error) {
        // handle error (skip or log)
      }
    }

    let fetchedTeamIds = convertedLogos.filter((x) => x).map((a) => a['teamId'])

    logger.debug('TEAM LOGOS. Got new team logo id: %o', fetchedTeamIds)

    // Save conversion fetchedTeamIds locally.
    convertedLogos.forEach((logoKvp) => {
      try {
        if (logoKvp) {
          // extra check for exceptions
          const teamId = logoKvp['teamId']
          const base64Png = logoKvp['png64']

          logger.debug('TEAM LOGOS, add: %s', teamId)

          if (!this.#logos.has(teamId)) {
            this.#logos.set(teamId, base64Png)
          }
        }
      } catch (error) {
        logger.warn(JSON.stringify(logoKvp))
      }
    })

    logger.debug('TEAM LOGOS. Team logos after update: %o.', Array.from(this.#logos.keys()))
  }

  /**
   * Check if team logo is in local cache.
   * @param {string} teamId
   */
  hasTeamLogo(teamId) {
    return this.#logos.has(teamId)
  }

  /**
   * Get base64 png team logo by team id.
   * @param  {string} teamId
   * @returns {string} base64 encoded png logo or empty string.
   */
  getTeamLogoPngBase64(teamId) {
    if (this.#logos.has(teamId)) {
      logger.debug('TeamLogos. Get team logo: %s', teamId)
      return this.#logos.get(teamId)
    }

    logger.debug('TeamLogos. Missing team logo: %s', teamId)
    return ''
  }

  /**
   * Fetch a single team logo by teamId from the remote source if not cached.
   * @param {number} teamId
   * @param {SibConnection} connectionCfg - Should have sibIpPort and token properties.
   * @returns {Promise<string>} base64 encoded png logo or empty string.
   */
  async fetchTeamLogoById(teamId, connectionCfg) {
    if (this.#logos.has(teamId)) {
      logger.debug('TeamLogos. fetchTeamLogoById: cache hit for %s', teamId)
      return this.#logos.get(teamId)
    }
    try {
      const teamLogo = await sibHttpClientGetTeamLogo(
        connectionCfg.sibIpPort,
        teamId,
        connectionCfg.token,
        this.#deviceId
      )
      if (teamLogo && teamLogo.logoBase64 !== '') {
        this.#logos.set(teamId, teamLogo.logoBase64)
        logger.debug('TeamLogos. fetchTeamLogoById: fetched and cached %s', teamId)
        return teamLogo.logoBase64
      } else {
        logger.debug('TeamLogos. fetchTeamLogoById: team logo not found or empty for %s', teamId)
        return ''
      }
    } catch (error) {
      logger.warn(`TeamLogos. fetchTeamLogoById: error fetching team logo ${teamId}: ${error}`)
      return ''
    }
  }
}
