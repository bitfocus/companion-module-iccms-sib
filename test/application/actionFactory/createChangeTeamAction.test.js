// Unit tests for createChangeTeamAction

import { createChangeTeamAction } from '../../../src/application/actionFactory/createChangeTeamAction.js'
import { SibConnection } from '../../../src/infrastructure/connection/sibConnection.js'
import { sibHttpClientChangeTeamById } from '../../../src/infrastructure/connection/sibHttpClient.js'

vi.mock('../../../src/infrastructure/connection/sibHttpClient.js', () => ({
	sibHttpClientChangeTeamById: vi.fn(),
}))

describe('createChangeTeamAction', () => {
	const apiPass = 'api_pass'
	const helperPass = 'helper_pass'

	// token (API pass) and helperToken intentionally differ so we can assert
	// the change-team REST endpoint authenticates with the API pass, not the helper pass.
	const sibConfig = new SibConnection('127.0.0.1', 8080, apiPass, false, false, false, helperPass, false)

	async function invoke(teamType = 'h', teamOid = 3) {
		const action = createChangeTeamAction([], sibConfig, sibHttpClientChangeTeamById)
		await action.callback({ options: { team_type: teamType, team_oid: teamOid } })
	}

	test('passes the API token (sibConfig.token), not the helper pass', async () => {
		// act
		await invoke('h', 3)

		// assert
		expect(sibHttpClientChangeTeamById).toHaveBeenCalledWith('127.0.0.1:8080', 'h', 3, apiPass)
		expect(sibHttpClientChangeTeamById).not.toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			expect.anything(),
			helperPass,
		)
	})

	test('the token passed is defined', async () => {
		// act
		await invoke('g', 1)

		// assert
		const passedToken = sibHttpClientChangeTeamById.mock.calls[0][3]
		expect(passedToken).toBeDefined()
		expect(passedToken).toBe(apiPass)
	})
})
