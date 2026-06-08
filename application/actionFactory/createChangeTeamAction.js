import { actionId } from '../actionId.js'
import { apiSportTeamType } from '../../infrastructure/sib-api/apiSportTeamType.js'
import { getChoicesForChangeTeamAction } from '../presetFactory/getChoicesForChangeTeamAction.js'
import { logger } from '../../logger.js'
import objectPath from 'object-path'

/**
 * Creates the Change Team action definition.
 * @param {ApiSportTeamWithoutPlayers[]} allTeams
 * @param {SibConnection} sibConfig
 * @param {Function} sibHttpClientChangeTeamById
 * @returns {object} Action definition
 */
export function createChangeTeamAction(allTeams, sibConfig, sibHttpClientChangeTeamById) {
	return {
		name: 'Change team',
		options: [
			{
				type: 'dropdown',
				label: 'Team to change',
				id: 'team_type',
				default: apiSportTeamType.Home,
				tooltip: 'Which team to change?',
				choices: [
					{ id: apiSportTeamType.Home, label: 'Home' },
					{ id: apiSportTeamType.Guest, label: 'Guest' },
				],
			},
			{
				type: 'dropdown',
				label: 'Select team',
				id: 'team_oid',
				default: -1,
				tooltip: 'Change match home or guest team.',
				choices: getChoicesForChangeTeamAction(allTeams),
			},
		],
		callback: async (event) => {
			logger.debug('Change team (sib_action_change_team): %s', event.options[actionId.ChangeTeam])

			const sibIpPort = sibConfig.sibIpPort
			const sibTeamType = objectPath.get(event.options, 'team_type', 'h')
			const sibTeamOid = objectPath.get(event.options, 'team_oid', -1)

			logger.debug('Change team from startup. Type %s, id %s.', sibTeamType, sibTeamOid)

			try {
				logger.debug('Fire (sib_action_change_team): %s', event.options[actionId.ChangeTeam])
				sibHttpClientChangeTeamById(sibIpPort, sibTeamType, sibTeamOid)
			} catch (e) {
				logger.error('Got error from teams client.')
			}
		},
	}
}
