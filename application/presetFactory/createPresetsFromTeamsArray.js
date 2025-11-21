import { createPresetFromTeam } from './createPresetFromTeam.js'
import { apiSportTeamType } from '../../infrastructure/protocol/apiSportTeamType.js'

/**
 * Create presets from collection teams.
 * Makes home and guest presets.
 *
 * Don't create presets for collections without teams.
 *
 * NOTE: only one level of nesting is possible.
 * @param {ApiSportTeamWithoutPlayers[]} collections
 * @returns {*} presets for setPresetDefinitions, <a href="https://github.com/bitfocus/companion-module-base/wiki/Presets">Presets</a>
 */
export function createPresetsFromTeamsArray(collections) {
	if (!Array.isArray(collections) || !collections) {
		return []
	}
	const presets = {}

	// home
	collections.forEach((team) => {
		const presetQb = createPresetFromTeam(team, apiSportTeamType.Home)

		if (presetQb != null) {
			presets[`preset_home_team_${team.Id}`] = presetQb
		}
	})

	// guest
	collections.forEach((team) => {
		const presetQb = createPresetFromTeam(team, apiSportTeamType.Guest)

		if (presetQb != null) {
			presets[`preset_guest_team_${team.Id}`] = presetQb
		}
	})

	return presets
}
