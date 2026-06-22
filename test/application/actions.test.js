// Unit tests for updateActionsAtStartup (inline "Change team" startup variant)

import { updateActionsAtStartup } from '../../src/application/actions.js'
import { actionId } from '../../src/application/actionId.js'
import { SibConnection } from '../../src/infrastructure/connection/sibConnection.js'

describe('updateActionsAtStartup', () => {
	const apiPass = 'api_pass'
	const helperPass = 'helper_pass'

	// token (API pass) and helperToken intentionally differ so we can assert
	// the startup change-team callback authenticates with the API pass.
	const sibConfig = new SibConnection('127.0.0.1', 8080, apiPass, false, helperPass, false)

	function buildAndInvokeChangeTeam(teamType = 'h', teamOid = 3) {
		// arrange — capture the action definitions registered on the module
		let registered
		const self = { setActionDefinitions: (defs) => (registered = defs) }
		const changeTeamClient = vi.fn()

		// act
		updateActionsAtStartup(self, undefined, sibConfig, changeTeamClient)
		registered[actionId.ChangeTeam].callback({ options: { team_type: teamType, team_oid: teamOid } })

		return changeTeamClient
	}

	test('startup Change team passes the API token (sibConfig.token)', () => {
		// act
		const changeTeamClient = buildAndInvokeChangeTeam('h', 3)

		// assert
		expect(changeTeamClient).toHaveBeenCalledWith('127.0.0.1:8080', 'h', 3, apiPass)
		expect(changeTeamClient).not.toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			expect.anything(),
			helperPass,
		)
	})

	test('the token passed is defined', () => {
		// act
		const changeTeamClient = buildAndInvokeChangeTeam('g', 1)

		// assert
		const passedToken = changeTeamClient.mock.calls[0][3]
		expect(passedToken).toBeDefined()
		expect(passedToken).toBe(apiPass)
	})
})
