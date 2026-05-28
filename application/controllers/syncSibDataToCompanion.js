import {updatePresetsAtRuntime} from '../presetFactory/updatePresetsAtRuntime.js'
import {logger} from '../../logger.js'
import {updateActionsAtRuntime} from '../actions.js'
import {getAllUniqueIconIdsFromQbCollectionsAndRundowns} from '../../domain/iconUtils.js'
import {
  sibHttpClientChangeTeamById,
  sibHttpClientTriggerQuickButtonById,
} from '../../infrastructure/connection/sibHttpClient.js'

/**
 * Synchronizes SIB data to Companion module definitions.
 * Handles QuickButton collections, teams, icons, and creates corresponding presets and actions.
 *
 * @param {SibComputer} sibComputer
 * @param {SibIcons} sibIcons Holds all icons as name and converted value
 * @param {TeamLogos} teamLogos Team logo cache keyed by team OID
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} qbCollections Already parsed QuickButton collections
 * @param {SibPluginInstance} cmpModule
 * @param {SibWebSocket} sibSocket
 * @param {ApiSportTeamWithoutPlayers[]} allTeams All teams from API
 * @param {ApiRundownWithoutItemsArray} allRundowns all rundowns from api
 * @returns {Promise<boolean>} true if all icons fetched, false if icon fetch was interrupted by rate limit.
 */
export async function syncSibDataToCompanion(
  sibComputer,
  sibIcons,
  teamLogos,
  qbCollections,
  cmpModule,
  sibSocket,
  allTeams,
  allRundowns
) {
  logger.debug('syncSibDataToCompanion. Begin.')

  if (!Array.isArray(qbCollections)) {
    logger.warn('syncSibDataToCompanion. qbCollections is not an array.')
    return true
  }

  logger.debug(`qbCollections ${qbCollections.length}`)

  const iconIds = getAllUniqueIconIdsFromQbCollectionsAndRundowns(qbCollections, allRundowns)

  const totalIcons = iconIds ? iconIds.size || iconIds.length || 0 : 0
  const cachedIcons = sibIcons.cachedCount
  const toFetch = totalIcons - cachedIcons
  logger.debug('syncSibDataToCompanion. Icons — total: %d, cached: %d, to fetch: %d.', totalIcons, cachedIcons, toFetch > 0 ? toFetch : 0)

  const sibConfig = sibComputer.getConnectionConfig()

  const iconsComplete = await sibIcons.updateIcons(iconIds, sibConfig, sibComputer.getSibVersion())

  if (Array.isArray(allTeams) && allTeams.length > 0) {
    const uniqueTeamIds = [...new Set(allTeams.map(t => t.Id).filter(id => id != null))]
    if (uniqueTeamIds.length > 0) {
      try {
        await teamLogos.updateTeamLogos(uniqueTeamIds, sibConfig, sibComputer.getSibVersion())
      } catch (logoError) {
        logger.error('syncSibDataToCompanion. Failed to update team logos: %s', logoError)
      }
    }
  }

// Update actions first
  updateActionsAtRuntime(
    cmpModule,
    sibComputer.getApiUrl(),
    sibHttpClientTriggerQuickButtonById,
    qbCollections,
    sibSocket,
    sibConfig,
    sibHttpClientChangeTeamById,
    allTeams,
    allRundowns
  )

// Then update presets
  updatePresetsAtRuntime(
    cmpModule,
    sibComputer,
    sibIcons,
    teamLogos,
    allTeams,
    allRundowns
  )

  logger.debug(`syncSibDataToCompanion. Done. Icons complete: ${iconsComplete}`)

  return iconsComplete
}
