import { createPresetsFromCollectionsWithGroupsAndButtons } from './createPresetsFromCollectionsWithGroupsAndButtons.js'
import { createPresetsFromTeamsArray } from './createPresetsFromTeamsArray.js'
import { createPresetsFromRundownsArray } from './createPresetsFromRundownsArray.js'
import { logger } from '../../logger.js'

/**
 * Aggregates and sets all presets on the Companion module.
 *
 * @param {SibPluginInstance} cmpModule
 * @param {SibComputer} sibComputer
 * @param {SibIcons} sibIcons
 * @param {ApiSportTeamWithoutPlayers[]} allTeams
 * @param {ApiRundownWithoutItemsArray} allRundowns
 */
export function updatePresetsAtRuntime(cmpModule, sibComputer, sibIcons, allTeams, allRundowns) {
  logger.debug('[updatePresetsAtRuntime] Start updating presets at runtime')
  let presetsAll = {}

  // Collections for presets
  const collectionsForPreset = sibComputer.getCollectionsWithButtons()
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

  // Rundown presets
  const rundownPresets = createPresetsFromRundownsArray(allRundowns, sibIcons)
  if (rundownPresets != null) {
    for (const [key, pObject] of Object.entries(rundownPresets)) {
      presetsAll[key] = pObject
    }
  }

  cmpModule.setPresetDefinitions(presetsAll)
  logger.debug('[updatePresetsAtRuntime] Finished updating presets at runtime')
}
