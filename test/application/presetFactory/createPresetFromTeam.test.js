import { SibIcons } from '../../../domain/sibIcons.js'
import { actionId } from '../../../application/actionId.js'
import { createPresetFromTeam } from '../../../application/presetFactory/createPresetFromTeam.js'
import { ApiSportTeamWithoutPlayers } from '../../../infrastructure/protocol/apiSportTeamWithoutPlayers.js'

describe('Create preset from team', () => {
	test('Default values', () => {
		// arrange
		let expected = new ApiSportTeamWithoutPlayers()
		expected.Id = 4
		expected.Name = 'Team Arlen'
		expected.ShortName = 'T-Arl'
		expected.LogoBase64 = 'logo_64'
		expected.LogoSmallBase64 = 'logo_small_64'
		expected.TeamColorHex = '#F2EA35FF'

		// act
		const actual = createPresetFromTeam(expected)

		// assert
		expect(actual['type']).toBe('button')
		expect(actual['category']).toBe('Change team')
		expect(actual['name']).toBe(`Change team to ${expected.Name}`)

		// style
		expect(actual.style['text']).toBe(expected.Name)
		expect(actual.style['color']).toBe(16777215)
		expect(actual.style['bgcolor']).toBe(15919669)
		expect(actual.style['png64']).toBe('logo_small_64')

		// steps

		// up
		expect(actual.steps[0].down[0].actionId).toBe(actionId.ChangeTeam)
		//(actual.steps[0].down[0].options[actionId.ChangeTeam]).toBe(expected.Id)

		// down
		expect(actual.steps[0].up).toEqual(expect.any(Array))

		// feedbacks
		expect(actual.feedbacks).toEqual(expect.any(Array))
	})
})
