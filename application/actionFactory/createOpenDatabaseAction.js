import { actionId } from '../actionId.js'
import { ApiOpenDatabase } from '../../infrastructure/sib-api/apiOpenDatabase.js'
import { logger } from '../../logger.js'
import objectPath from 'object-path'

/**
 * Creates the Open Database action definition.
 * @param {SibConnection} sibConfig
 * @param {SibWebSocket} sibSocket
 * @returns {object} Action definition
 */
export function createOpenDatabaseAction(sibConfig, sibSocket) {
	return {
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
}
