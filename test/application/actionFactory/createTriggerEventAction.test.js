// Unit tests for createTriggerEventAction

import { createTriggerEventAction } from '../../../src/application/actionFactory/createTriggerEventAction.js'
import { actionId } from '../../../src/application/actionId.js'

describe('createTriggerEventAction', () => {
	const restBaseUrl = '127.0.0.1:8080'
	const apiPass = 'api_pass'

	function invoke(triggerId, token = apiPass) {
		const triggerClient = vi.fn()
		const action = createTriggerEventAction([], restBaseUrl, triggerClient, token)
		action.callback({ options: { [actionId.TriggerEvent]: triggerId } })
		return triggerClient
	}

	test('passes the API token (sibConfig.token) to the trigger client', () => {
		// act
		const triggerClient = invoke(42)

		// assert
		expect(triggerClient).toHaveBeenCalledWith(restBaseUrl, 42, apiPass)
	})

	test('the token passed is defined', () => {
		// act
		const triggerClient = invoke(7)

		// assert
		const passedToken = triggerClient.mock.calls[0][2]
		expect(passedToken).toBeDefined()
		expect(passedToken).toBe(apiPass)
	})
})
