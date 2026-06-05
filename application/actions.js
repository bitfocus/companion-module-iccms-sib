import { actionId } from './actionId.js'
import { logger } from '../logger.js'
import { createTriggerEventAction } from './actionFactory/createTriggerEventAction.js'
import { createOpenDatabaseAction } from './actionFactory/createOpenDatabaseAction.js'
import { createChangeTeamAction } from './actionFactory/createChangeTeamAction.js'
import { createRundownControlAction } from './actionFactory/createRundownControlAction.js'
import { ApiOpenDatabase } from '../infrastructure/sib-api/apiOpenDatabase.js'
import objectPath from 'object-path'
import { apiSportTeamType } from '../infrastructure/sib-api/apiSportTeamType.js'

/**
 * Update drop-down from buttons.
 *
 * Modules are able to expose values to the user, which they can use as part of the button text, or as input to some actions.
 *
 * Note: Please try not to do it too often, as updating the list has a cost.
 * If you are calling it multiple times in a short span of time, consider if it would be possible to batch the calls, so it is only done once.
 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/actions">Actions V3</a>
 * @see <a href="https://github.com/bitfocus/companion/wiki/Actions">Actions v2</a>
 * @param {*} self
 * @param {string} restBaseUrl rest url to sibIp. With ip and port.
 * @param sibHttpClientTriggerQbById
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} qbCollections
 * @param {SibWebSocket} sibSocket
 * @param {SibConnection} sibConfig
 * @param sibHttpClientChangeTeamById http client to change team.
 * @param {ApiSportTeamWithoutPlayers[]} allTeams all teams from api
 * @param {ApiRundownWithoutItemsArray} allRundowns all rundowns from api
 */
export function updateActionsAtRuntime(
	self,
	restBaseUrl,
	sibHttpClientTriggerQbById,
	qbCollections,
	sibSocket,
	sibConfig,
	sibHttpClientChangeTeamById,
	allTeams,
	allRundowns
) {
	logger.debug('Update actions from buttons.')

	const my_actions = {}

	my_actions[actionId.TriggerEvent] = createTriggerEventAction(qbCollections, restBaseUrl, sibHttpClientTriggerQbById)
	my_actions[actionId.OpenDatabase] = createOpenDatabaseAction(sibConfig, sibSocket)
	my_actions[actionId.ChangeTeam] = createChangeTeamAction(allTeams, sibConfig, sibHttpClientChangeTeamById)
	my_actions[actionId.Rundown] = createRundownControlAction(allRundowns, sibConfig, self)

	self.setActionDefinitions(my_actions)
}

/**
 * Update actions that don't require sib to start-.
 *
 * Modules are able to expose values to the user, which they can use as part of the button text, or as input to some actions.
 *
 * Note: Please try not to do it too often, as updating the list has a cost.
 * If you are calling it multiple times in a short span of time, consider if it would be possible to batch the calls, so it is only done once.
 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/actions">Actions V3</a>
 * @see <a href="https://github.com/bitfocus/companion/wiki/Actions">Actions v2</a>
 * @param {*} self
 * @param {SibWebSocket} sibSocket
 * @param {SibConnection} sibConfig
 * @param sibHttpClientChangeTeamById http client to change team
 */
export function updateActionsAtStartup(self, sibSocket, sibConfig, sibHttpClientChangeTeamById) {
	logger.debug('Update actions at startup.')

	const my_actions = {}

	my_actions[actionId.OpenDatabase] = createOpenDatabaseAction(sibConfig, sibSocket)

	// For startup, team action uses numeric input instead of dropdown
	my_actions[actionId.ChangeTeam] = {
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
				type: 'number',
				id: 'team_oid',
				label: 'Team Id from teams api,',
				tooltip: 'Requires connection to sib to get teams as dro-down.',
				default: 0,
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

	self.setActionDefinitions(my_actions)
}
