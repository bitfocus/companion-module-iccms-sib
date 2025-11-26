import { parseCollectionWithGroupsAndButtonsArray } from '../../infrastructure/parsers/parseCollectionWithGroupsAndButtonsArray.js'
import { createPresetsFromCollectionsWithGroupsAndButtons } from '../presetFactory/createPresetsFromCollectionsWithGroupsAndButtons.js'
import { logger } from '../../logger.js'
import { updateActionsAtRuntime } from '../actions.js'
import {
	sibHttpClientChangeTeamById,
	sibHttpClientTriggerQuickButtonById,
} from '../../infrastructure/connection/sibHttpClient.js'
import { createPresetsFromTeamsArray } from '../presetFactory/createPresetsFromTeamsArray.js'

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
 * @param {ApiRundownWithoutItemsDto[]} allRundowns all rundowns from api
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

	let presetsAll = {}

	if (typeof apiCommand !== 'object') {
		logger.warn('syncSibDataToCompanion. Parsed is not an object.')
		return null
	}

	const parsedCollectionsJson = parseCollectionWithGroupsAndButtonsArray(apiCommand)

	logger.debug(`parsedCollectionsJson ${parsedCollectionsJson.length}`)

	sibComputer.setSibCollections(parsedCollectionsJson)
	await sibIcons.updateIcons(parsedCollectionsJson, sibComputer.getConnectionConfig(), sibComputer.getSibVersion())

	// At this point, we have all correct data about open database.
	// Get data that can be used in companion back and create its objects.
	const collectionsForPreset = sibComputer.getCollectionsWithButtons()

	// Create presets and set to module.
	const colPresets = createPresetsFromCollectionsWithGroupsAndButtons(collectionsForPreset, sibIcons)

	if (colPresets != null) {
		for (const [key, pObject] of Object.entries(colPresets)) {
			presetsAll[key] = pObject
		}
	}

	// Teams presets
	const teamPresets = createPresetsFromTeamsArray(allTeams)

	if (teamPresets != null) {
		for (const [key, pObject] of Object.entries(teamPresets)) {
			presetsAll[key] = pObject
		}
	}

	const sibConfig = sibComputer.getConnectionConfig()

	// Send it to the module.
	updateActionsAtRuntime(
		cmpModule,
		sibComputer.getApiUrl(),
		sibHttpClientTriggerQuickButtonById,
		parsedCollectionsJson,
		sibSocket,
		sibConfig,
		sibHttpClientChangeTeamById,
		allTeams,
    allRundowns
	)
	cmpModule.setPresetDefinitions(presetsAll)

	logger.debug(`controllerQuickButtonCollections. Done.`)
}
