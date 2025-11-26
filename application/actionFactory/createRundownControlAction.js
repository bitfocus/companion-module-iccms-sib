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
 * Option IDs for Rundown Control action
 * @private
 */
const OPTION_ID = {
	ACTION_TYPE: 'action_type',
	RUNDOWN_ID: 'rundown_id',
}

/**
 * Action type values for Rundown Control
 * @private
 */
const ACTION_TYPE = {
	SELECT_RUNDOWN: 'select_rundown',
	RUN_LINE: 'current_run_line',
	SELECT_PREV: 'current_select_prev',
	SELECT_NEXT: 'current_select_next',
}

/**
 * Creates the Rundown Control action definition.
 * @param {ApiRundownWithoutItemsArray} allRundowns
 * @param {SibConnection} sibConfig
 * @param {*} self
 * @returns {object} Action definition
 */
export function createRundownControlAction(allRundowns, sibConfig, self) {
	return {
		name: 'Rundown Control',
		options: [
			{
				type: 'dropdown',
				label: 'Action',
				id: OPTION_ID.ACTION_TYPE,
				default: ACTION_TYPE.SELECT_RUNDOWN,
				tooltip: 'Select rundown control action',
				choices: [
					{ id: ACTION_TYPE.SELECT_RUNDOWN, label: 'Select rundown' },
					{ id: ACTION_TYPE.RUN_LINE, label: 'Run selected line' },
					{ id: ACTION_TYPE.SELECT_PREV, label: 'Select previous line' },
					{ id: ACTION_TYPE.SELECT_NEXT, label: 'Select next line' },
				],
			},
			{
				type: 'dropdown',
				label: 'Rundown',
				id: OPTION_ID.RUNDOWN_ID,
				default: -1,
				tooltip: 'Select rundown from list',
				choices: getChoicesForRundownAction(allRundowns),
				isVisible: (options) => {
					return options.action_type === ACTION_TYPE.SELECT_RUNDOWN || options.action_type === ACTION_TYPE.RUN_LINE
				},
			},
		],
		callback: async (event) => {
			logger.debug('Rundown control (sib_action_rundown_control): %s', event.options[OPTION_ID.ACTION_TYPE])

			const sibIpPort = sibConfig.sibIpPort
			const sibToken = sibConfig.sibHelperPass
			const sibDeviceId = self.id
			const actionType = objectPath.get(event.options, OPTION_ID.ACTION_TYPE, ACTION_TYPE.SELECT_RUNDOWN)
			const rundownId = objectPath.get(event.options, OPTION_ID.RUNDOWN_ID, -1)

			try {
				switch (actionType) {
					case ACTION_TYPE.SELECT_RUNDOWN:
						logger.debug('Select rundown: %s', rundownId)
						await sibHttpClientRundownSelect(sibIpPort, rundownId, sibToken, sibDeviceId)
						break

					case ACTION_TYPE.RUN_LINE:
						logger.debug('Run selected line in rundown: %s', rundownId)
						await sibHttpClientRundownSelectedItemRun(sibIpPort, rundownId, sibToken, sibDeviceId)
						break

					case ACTION_TYPE.SELECT_PREV:
						logger.debug('Select previous line in current rundown')
						await sibHttpClientRundownSelectPreviousItem(sibIpPort, sibToken, sibDeviceId)
						break

					case ACTION_TYPE.SELECT_NEXT:
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
