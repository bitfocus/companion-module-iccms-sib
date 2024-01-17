import { actionId } from '../../../application/actionId.js'
import { createPresetFromTeam } from '../../../application/presetFactory/createPresetFromTeam.js'
import { ApiSportTeamWithoutPlayers } from '../../../infrastructure/protocol/apiSportTeamWithoutPlayers.js'
import { apiSportTeamType } from '../../../infrastructure/protocol/apiSportTeamType.js'
import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'

describe('Create preset from team', () => {
	const teamWithSmallLogoFixture = defineFixture((t) => {
		t['Id'].asNumber({ min: 1 })
		t['Name'].asString()
		t['ShortName'].asString()
		t['LogoBase64'].as(() => '')
		t['LogoSmallBase64'].as(() => faker.internet.emoji())
		t['TeamColorHex'].as(() => faker.color.rgb({ format: 'hex', casing: 'upper' }))
	})

	const teamWithDarkColorFixture = defineFixture((t) => {
		t['Id'].asNumber({ min: 1 })
		t['Name'].asString()
		t['ShortName'].asString()
		t['LogoBase64'].as(() => '')
		t['LogoSmallBase64'].as(() => '')
		t['TeamColorHex'].as(() => '#36454F') // Charcoal, (54,69,79), #36454F
	})

	const teamWithLightColorFixture = defineFixture((t) => {
		t['Id'].asNumber({ min: 1 })
		t['Name'].asString()
		t['ShortName'].asString()
		t['LogoBase64'].as(() => '')
		t['LogoSmallBase64'].as(() => '')
		t['TeamColorHex'].as(() => '#EEDD82') // Light, (238,221,130),  #EEDD82
	})

	const clrBlack = 0
	const clrWhite = 16777215

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
		const actual = createPresetFromTeam(expected, apiSportTeamType.Home)

		// assert
		expect(actual['type']).toBe('button')
		expect(actual['category']).toBe('Change home team')
		expect(actual['name']).toBe(`Change home team to ${expected.Name}`)

		// style
		expect(actual.style['text']).toBe(expected.Name)
		expect(actual.style['color']).toBe(16777215)
		expect(actual.style['bgcolor']).toBe(0)
		expect(actual.style['png64']).toBe('logo_small_64')

		// steps

		// down
		expect(actual.steps[0].down[0].actionId).toBe(actionId.ChangeTeam)
		expect(actual.steps[0].down[0].options['team_type']).toBe(apiSportTeamType.Home)
		expect(actual.steps[0].down[0].options['team_oid']).toBe(expected.Id)

		// up
		expect(actual.steps[0].up).toEqual(expect.any(Array))

		// feedbacks
		expect(actual.feedbacks).toEqual(expect.any(Array))
	})

	test('If there is small logo, make background black and foreground white', () => {
		// arrange
		let expected = teamWithSmallLogoFixture.create()

		// act
		const actual = createPresetFromTeam(expected, apiSportTeamType.Home)

		// assert
		expect(actual.style['color']).toBe(clrWhite)
		expect(actual.style['bgcolor']).toBe(clrBlack)
		expect(actual.style['png64']).toBe(expected['LogoSmallBase64'])
	})

	test('If there is no logo and team color is dark, make background white', () => {
		// arrange
		let expected = teamWithDarkColorFixture.create()

		// act
		const actual = createPresetFromTeam(expected, apiSportTeamType.Home)

		// assert
		expect(actual.style['color']).toBe(clrWhite)
		expect(actual.style['bgcolor']).toBe(3556687)
		expect(actual.style['png64']).toBeUndefined()
	})

	test('If there is no logo and team color is light, make background black', () => {
		// arrange
		let expected = teamWithLightColorFixture.create()

		// act
		const actual = createPresetFromTeam(expected, apiSportTeamType.Home)

		// assert
		expect(actual.style['color']).toBe(clrBlack)
		expect(actual.style['bgcolor']).toBe(15654274)
		expect(actual.style['png64']).toBeUndefined()
	})
})
