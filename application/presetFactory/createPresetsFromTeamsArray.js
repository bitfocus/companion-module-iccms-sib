import { createPresetFromTeam } from './createPresetFromTeam.js'

/**
 * Create presets from collection teams.
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

	// Collections (can only have one parent category, use separator.)
	collections.forEach((team) => {
		const presetQb = createPresetFromTeam(team)

		if (presetQb != null) {
			presets[`preset_team_${team.Id}`] = presetQb
		}
	})

	return presets
}
