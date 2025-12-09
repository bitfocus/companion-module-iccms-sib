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
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} qbCollections Already parsed QuickButton collections
 * @param {SibPluginInstance} cmpModule
 * @param {SibWebSocket} sibSocket
 * @param {ApiSportTeamWithoutPlayers[]} allTeams All teams from API
 * @param {ApiRundownWithoutItemsArray} allRundowns all rundowns from api
 */
export async function syncSibDataToCompanion(
  sibComputer,
  sibIcons,
  qbCollections,
  cmpModule,
  sibSocket,
  allTeams,
  allRundowns
) {
  logger.debug('syncSibDataToCompanion. Begin.')

  if (!Array.isArray(qbCollections)) {
    logger.warn('syncSibDataToCompanion. qbCollections is not an array.')
    return null
  }

  logger.debug(`qbCollections ${qbCollections.length}`)

  const iconIds = getAllUniqueIconIdsFromQbCollectionsAndRundowns(qbCollections, allRundowns)

  await sibIcons.updateIcons(iconIds, sibComputer.getConnectionConfig(), sibComputer.getSibVersion())

  const sibConfig = sibComputer.getConnectionConfig()

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
    allTeams,
    allRundowns
  )

  logger.debug(`syncSibDataToCompanion. Done.`)
}
