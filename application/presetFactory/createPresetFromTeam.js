import { combineRgb } from '@companion-module/base'
import { actionId } from '../actionId.js'
import { colord } from 'colord'
import { apiSportTeamType } from '../../infrastructure/protocol/apiSportTeamType.js'

/**
 * Create companion preset from qb collection with groups and buttons.
 * @param {ApiSportTeamWithoutPlayers} team
 * @param {string} teamType - home / h or guest /g
 * @returns {*} presets for setPresetDefinitions, <a href="https://github.com/bitfocus/companion-module-base/wiki/Presets">Presets</a>
 */
export function createPresetFromTeam(team, teamType) {
	if (typeof team == 'undefined') {
		return null
	}

	let bgClrInt = -1
	let clr

	if (team.TeamColorHex !== '') {
		clr = colord(team.TeamColorHex).toRgb()
		bgClrInt = combineRgb(clr.r, clr.g, clr.b)
	}

	let catName
	if (teamType === apiSportTeamType.Home) {
		catName = 'Change home team'
	} else {
		catName = 'Change guest team'
	}

	let presetName
	if (teamType === apiSportTeamType.Home) {
		presetName = `Change home team to ${team.Name}`
	} else {
		presetName = `Change guest team to ${team.Name}`
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
		category: catName,

		/**
		 * A name for the preset. Shown to the user when they hover over it.
		 * @example Fire events of End Of Match
		 */
		name: presetName,

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
							['team_type']: teamType,
							['team_oid']: team.Id,
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
		// with logo, ignore team color
		presetTeam.style.color = combineRgb(255, 255, 255)
		presetTeam.style.bgcolor = combineRgb(0, 0, 0)
		presetTeam.style.png64 = team.LogoSmallBase64
	} else {
		// no logo, use team color.
		if (colord(team.TeamColorHex).isDark()) {
			presetTeam.style.color = combineRgb(255, 255, 255)
		} else {
			presetTeam.style.color = combineRgb(0, 0, 0)
		}
		presetTeam.style.bgcolor = bgClrInt
	}

	return presetTeam
}
