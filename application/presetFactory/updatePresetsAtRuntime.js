import { createPresetsFromCollectionsWithGroupsAndButtons } from './createPresetsFromCollectionsWithGroupsAndButtons.js'
import { createPresetsFromTeamsArray } from './createPresetsFromTeamsArray.js'

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

  cmpModule.setPresetDefinitions(presetsAll)
}
