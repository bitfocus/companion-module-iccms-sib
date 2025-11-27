import {
  parseCollectionWithGroupsAndButtonsArray
} from '../../infrastructure/parsers/parseCollectionWithGroupsAndButtonsArray.js'
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
 * @param {string} apiCommand QuickButton collections from API
 * @param {SibPluginInstance} cmpModule
 * @param {SibWebSocket} sibSocket
 * @param {ApiSportTeamWithoutPlayers[]} allTeams All teams from API
 * @param {ApiRundownWithoutItemsArray} allRundowns all rundowns from api
 */
export async function syncSibDataToCompanion(
  sibComputer,
  sibIcons,
  apiCommand,
  cmpModule,
  sibSocket,
  allTeams,
  allRundowns
) {
  logger.debug('syncSibDataToCompanion. Begin.')

  if (typeof apiCommand !== 'object') {
    logger.warn('syncSibDataToCompanion. Parsed is not an object.')
    return null
  }

  const qbCollections = parseCollectionWithGroupsAndButtonsArray(apiCommand)

  logger.debug(`qbCollections ${qbCollections.length}`)

  sibComputer.setSibCollections(qbCollections)
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

  logger.debug(`controllerQuickButtonCollections. Done.`)
}
