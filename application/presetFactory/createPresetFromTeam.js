import { combineRgb } from '@companion-module/base'
import { actionId } from '../actionId.js'
import { colord } from 'colord'

/**
 * Create companion preset from qb collection with groups and buttons.
 * @param {ApiSportTeamWithoutPlayers} team
 * @returns {*} presets for setPresetDefinitions, <a href="https://github.com/bitfocus/companion-module-base/wiki/Presets">Presets</a>
 */
export function createPresetFromTeam(team) {
	if (typeof team == 'undefined') {
		return null
	}

	let bgClrInt = -1

	if (team.TeamColorHex !== '') {
		let clr = colord(team.TeamColorHex).toRgb()
		bgClrInt = combineRgb(clr.r, clr.g, clr.b)
	}

	const presetTeam = {
		/**
		 * This must be 'button' for now.
		 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/Input-Field-Types">Input Field Types</a>
		 */
		type: 'button',

		/**
		 * This groups presets into categories in the ui. Try to create logical groups to help users find presets.
		 * Collection is a top object and has no parent.
		 */
		category: 'Change team',

		/**
		 * A name for the preset. Shown to the user when they hover over it.
		 * @example Fire events of End Of Match
		 */
		name: `Change team to ${team.Name}`,

		// This is the minimal set of style properties you must define
		style: {
			// You can use variables from your module here
			text: team.Name,
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			pngalignment: 'center:center',
		},
		steps: [
			{
				down: [
					{
						// add an action on down press
						actionId: actionId.ChangeTeam,
						options: {
							[actionId.TriggerEvent]: team.Id,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// Override default if set.
	if (bgClrInt !== -1) {
		presetTeam.style.bgcolor = bgClrInt
	}

	if (team.LogoSmallBase64 !== '') {
		presetTeam.style.png64 = team.LogoSmallBase64
	}

	return presetTeam
}
