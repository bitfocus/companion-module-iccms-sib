// Unit tests for createRundownControlAction

import { createRundownControlAction } from '../../../src/application/actionFactory/createRundownControlAction.js'
import { SibConnection } from '../../../src/infrastructure/connection/sibConnection.js'
import {
	sibHttpClientRundownSelect,
	sibHttpClientRundownSelectedItemRun,
	sibHttpClientRundownSelectPreviousItem,
	sibHttpClientRundownSelectNextItem,
} from '../../../src/infrastructure/connection/sibHttpClient.js'

vi.mock('../../../src/infrastructure/connection/sibHttpClient.js', () => ({
	sibHttpClientRundownSelect: vi.fn(() => Promise.resolve()),
	sibHttpClientRundownSelectedItemRun: vi.fn(() => Promise.resolve()),
	sibHttpClientRundownSelectPreviousItem: vi.fn(() => Promise.resolve()),
	sibHttpClientRundownSelectNextItem: vi.fn(() => Promise.resolve()),
}))

describe('createRundownControlAction', () => {
	const apiPass = 'api_pass'
	const helperPass = 'helper_pass'
	const deviceId = 'device_123'

	// token (API pass) and helperToken intentionally differ so we can assert
	// the rundown REST endpoints authenticate with the API pass, not the helper pass.
	const sibConfig = new SibConnection('127.0.0.1', 8080, apiPass, false, false, false, helperPass, false)
	const self = { id: deviceId }

	function invoke(actionType, rundownId = 5) {
		const action = createRundownControlAction(undefined, sibConfig, self)
		return action.callback({ options: { action_type: actionType, rundown_id: rundownId } })
	}

	test('select_rundown passes the API token (sibConfig.token), not the helper pass', async () => {
		// act
		await invoke('select_rundown', 5)

		// assert
		expect(sibHttpClientRundownSelect).toHaveBeenCalledWith('127.0.0.1:8080', 5, apiPass, deviceId)
		expect(sibHttpClientRundownSelect).not.toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			helperPass,
			expect.anything(),
		)
	})

	test('current_run_line passes the API token (sibConfig.token)', async () => {
		// act
		await invoke('current_run_line', 7)

		// assert
		expect(sibHttpClientRundownSelectedItemRun).toHaveBeenCalledWith('127.0.0.1:8080', 7, apiPass, deviceId)
	})

	test('current_select_prev passes the API token (sibConfig.token)', async () => {
		// act
		await invoke('current_select_prev')

		// assert
		expect(sibHttpClientRundownSelectPreviousItem).toHaveBeenCalledWith('127.0.0.1:8080', apiPass, deviceId)
	})

	test('current_select_next passes the API token (sibConfig.token)', async () => {
		// act
		await invoke('current_select_next')

		// assert
		expect(sibHttpClientRundownSelectNextItem).toHaveBeenCalledWith('127.0.0.1:8080', apiPass, deviceId)
	})

	test('the token passed is defined (regression: sibHelperPass was always undefined)', async () => {
		// act
		await invoke('select_rundown', 1)

		// assert
		const passedToken = sibHttpClientRundownSelect.mock.calls[0][2]
		expect(passedToken).toBeDefined()
		expect(passedToken).toBe(apiPass)
	})
})
