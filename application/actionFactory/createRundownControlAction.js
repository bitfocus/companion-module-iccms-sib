import { actionId } from '../actionId.js'
import { getChoicesForRundownAction } from '../presetFactory/getChoicesForRundownAction.js'
import { logger } from '../../logger.js'
import objectPath from 'object-path'
import {
	sibHttpClientRundownSelect,
	sibHttpClientRundownSelectedItemRun,
	sibHttpClientRundownSelectPreviousItem,
	sibHttpClientRundownSelectNextItem,
} from '../../infrastructure/connection/sibHttpClient.js'

/**
 * Creates the Rundown Control action definition.
 * @param {ApiRundownWithoutItemsArray} allRundowns
 * @param {SibConnection} sibConfig
 * @param {*} self
 * @returns {object} Action definition
 */
export function createRundownControlAction(allRundowns, sibConfig, self) {
	return {
		name: 'Rundown',
		options: [
			{
				type: 'dropdown',
				label: 'Action',
				id: 'action_type',
				default: 'select_rundown',
				tooltip: 'Select rundown control action',
				choices: [
					{ id: 'select_rundown', label: 'Select rundown' },
					{ id: 'current_run_line', label: 'Run selected line' },
					{ id: 'current_select_prev', label: 'Select previous line' },
					{ id: 'current_select_next', label: 'Select next line' },
				],
			},
			{
				type: 'dropdown',
				label: 'Rundown',
				id: 'rundown_id',
				default: -1,
				tooltip: 'Select rundown from list',
				choices: getChoicesForRundownAction(allRundowns),
				isVisible: (options) => {
					return options.action_type === 'select_rundown' || options.action_type === 'current_run_line'
				},
			},
		],
		callback: async (event) => {
			logger.debug('Rundown control (sib_action_rundown_control): %s', event.options.action_type)

			const sibIpPort = sibConfig.sibIpPort
			const sibToken = sibConfig.sibHelperPass
			const sibDeviceId = self.id
			const actionType = objectPath.get(event.options, 'action_type', 'select_rundown')
			const rundownId = objectPath.get(event.options, 'rundown_id', -1)

			try {
				switch (actionType) {
					case 'select_rundown':
						logger.debug('Select rundown: %s', rundownId)
						await sibHttpClientRundownSelect(sibIpPort, rundownId, sibToken, sibDeviceId)
						break

					case 'current_run_line':
						logger.debug('Run selected line in rundown: %s', rundownId)
						await sibHttpClientRundownSelectedItemRun(sibIpPort, rundownId, sibToken, sibDeviceId)
						break

					case 'current_select_prev':
						logger.debug('Select previous line in current rundown')
						await sibHttpClientRundownSelectPreviousItem(sibIpPort, sibToken, sibDeviceId)
						break

					case 'current_select_next':
						logger.debug('Select next line in current rundown')
						await sibHttpClientRundownSelectNextItem(sibIpPort, sibToken, sibDeviceId)
						break

					default:
						logger.warn('Unknown rundown action type: %s', actionType)
				}
			} catch (e) {
				logger.error('Got error from rundown client: %s', e.message)
			}
		},
	}
}
