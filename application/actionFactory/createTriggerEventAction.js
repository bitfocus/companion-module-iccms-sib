import { actionId } from '../actionId.js'
import { getChoicesForTriggerEventAction } from '../presetFactory/getChoicesForTriggerEventAction.js'
import { logger } from '../../logger.js'

/**
 * Creates the Trigger Event action definition.
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} qbCollections
 * @param {string} restBaseUrl
 * @param {Function} sibHttpClientTriggerQbById
 * @returns {object} Action definition
 */
export function createTriggerEventAction(qbCollections, restBaseUrl, sibHttpClientTriggerQbById) {
	return {
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
}
