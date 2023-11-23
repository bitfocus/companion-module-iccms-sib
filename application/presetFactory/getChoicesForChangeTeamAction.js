import { logger } from '../../logger.js'

/**
 * Returns choices for change team preset.
 * @param {ApiSportTeamWithoutPlayers[]} allTeams
 * @returns {[]}
 */
export function getChoicesForChangeTeamAction(allTeams) {
	let options = []

	options.push({ id: -1, label: 'No teams' })

	if (!allTeams) return options

	if (!Array.isArray(allTeams) || !allTeams.length) {
		return options
	}

	allTeams.forEach((eTeam) => {
		try {
			options.push({ id: eTeam.Id, label: eTeam.Name })
		} catch (e) {
			logger.error('choices team loop, %s.', e)
		}
	})

	return options
}
