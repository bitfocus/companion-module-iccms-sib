import { actionId } from './actionId.js'
import { getChoicesForTriggerEventAction } from './presetFactory/getChoicesForTriggerEventAction.js'
import { logger } from '../logger.js'
import { ApiOpenDatabase } from '../infrastructure/protocol/apiOpenDatabase.js'
import objectPath from 'object-path'
import { apiSportTeamType } from '../infrastructure/protocol/apiSportTeamType.js'

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
 */
export function updateActionsFromButtons(
	self,
	restBaseUrl,
	sibHttpClientTriggerQbById,
	qbCollections,
	sibSocket,
	sibConfig
) {
	logger.debug('Update actions from buttons.')

	let my_actions = {}

	my_actions[actionId.TriggerEvent] = {
		name: 'Fire QuickButton',
		options: [
			{
				type: 'dropdown',
				id: actionId.TriggerEvent,
				label: 'TriggerID',
				default: -1,
				choices: getChoicesForTriggerEventAction(qbCollections),
				required: true,
			},
		],
		callback: (event) => {
			logger.debug('Fire TriggerId (my_action_trigger_event): %s', event.options[actionId.TriggerEvent])
			sibHttpClientTriggerQbById(restBaseUrl, event.options[actionId.TriggerEvent])
		},
	}

	my_actions[actionId.OpenDatabase] = {
		name: 'Open database',
		options: [
			{
				type: 'textinput',
				id: 'db_path',
				label: 'Database path',
				default: '',
				required: true,
			},
			{
				type: 'number',
				id: 'db_delay',
				label: 'Exit delay if Sport In The Box is running',
				tooltip:
					'0 - as usual, ask user to close\n-1 - close without confirmation\npositive number - wait X seconds and close',
				default: 0,
			},
		],
		callback: async (event) => {
			logger.debug('Fire open database (sib_action_open_database): %s', event.options[actionId.OpenDatabase])

			const sibIpPort = sibConfig.sibIpPort
			const sibDbpath = objectPath.get(event.options, 'db_path', '')
			const sibDelay = objectPath.get(event.options, 'db_delay', 0)
			const cmd = new ApiOpenDatabase(sibIpPort, sibDbpath, sibDelay)

			logger.debug('Open database from buttons : %s.', JSON.stringify(cmd))

			try {
				await sibSocket.openSibDatabaseAsync(cmd)
			} catch (e) {
				logger.error('Got error from socket.')
			}
		},
	}

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
 * @param sibHttpClientChangeTeamById
 */
export function updateActionsAtStartup(self, sibSocket, sibConfig, sibHttpClientChangeTeamById) {
	logger.debug('Update actions at startup.')

	let my_actions = {}

	my_actions[actionId.OpenDatabase] = {
		name: 'Open database',
		options: [
			{
				type: 'textinput',
				id: 'db_path',
				label: 'Database path',
				default: '',
				required: true,
			},
			{
				type: 'number',
				id: 'db_delay',
				label: 'Exit delay if Sport In The Box is running',
				tooltip:
					'0 - as usual, ask user to close\n-1 - close without confirmation\npositive number - wait X seconds and close',
				default: 0,
			},
		],
		callback: async (event) => {
			logger.debug('Fire open database (sib_action_open_database): %s', event.options[actionId.OpenDatabase])

			const sibIpPort = sibConfig.sibIpPort
			const sibDbpath = objectPath.get(event.options, 'db_path', '')
			const sibDelay = objectPath.get(event.options, 'db_delay', 0)
			const cmd = new ApiOpenDatabase(sibIpPort, sibDbpath, sibDelay)

			logger.debug('Open database from startup : %s', JSON.stringify(cmd))

			try {
				await sibSocket.openSibDatabaseAsync(cmd)
			} catch (e) {
				logger.error('Got error from socket.')
			}
		},
	}

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
