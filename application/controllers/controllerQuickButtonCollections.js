import { parseCollectionWithGroupsAndButtonsArray } from '../../infrastructure/acl/parseCollectionWithGroupsAndButtonsArray.js'
import { createPresetsFromCollectionsWithGroupsAndButtons } from '../presetFactory/createPresetsFromCollectionsWithGroupsAndButtons.js'
import { logger } from '../../logger.js'
import { updateActionsFromButtons } from '../actions.js'
import { sibHttpClientTriggerQuickButtonById } from '../../infrastructure/connection/sibHttpClient.js'

/**
 * Handles received QB and saves data locally.
 * Sets companion presets and variables.
 * @param {SibComputer} sibComputer
 * @param {SibIcons} sibIcons Holds all icons as name and converted value.
 * @param {string} apiCommand
 * @param {SibPluginInstance} cmpModule
 * @param {SibWebSocket} sibSocket
 */
export async function controllerQuickButtonCollections(sibComputer, sibIcons, apiCommand, cmpModule, sibSocket) {
	logger.debug('controllerQuickButtonCollections. Begin.')

	let presetsAll = {}

	if (typeof apiCommand !== 'object') {
		logger.warn('controllerQuickButtonCollections. Parsed is not an object.')
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

	// Send to module.
	updateActionsFromButtons(
		cmpModule,
		sibComputer.getApiUrl(),
		sibHttpClientTriggerQuickButtonById,
		parsedCollectionsJson,
		sibSocket
	)
	cmpModule.setPresetDefinitions(presetsAll)

	logger.debug(`controllerQuickButtonCollections. Done.`)
}
