import { parseApiSportTeamWithoutPlayers } from '../../../infrastructure/acl/parseApiSportTeamWithoutPlayers.js'

describe('ApiSportTeamWithoutPlayers deserialization', () => {
	test('Deserialized correctly', () => {
		// arrange
		let expected = {
			Id: 4,
			Name: 'Team Arlen',
			ShortName: 'T-Arl',
			LogoBase64: 'logo_64',
			LogoSmallBase64: 'logo_small_64',
			TeamColorHex: '#F2EA35FF',
		}

		// act
		const actual = parseApiSportTeamWithoutPlayers(expected)

		// assert
		expect(actual.Id).toBe(expected.Id)
		expect(actual.Name).toBe(expected.Name)
		expect(actual.ShortName).toBe(expected.ShortName)
		expect(actual.LogoBase64).toBe(expected.LogoBase64)
		expect(actual.LogoSmallBase64).toBe(expected.LogoSmallBase64)
		expect(actual.TeamColorHex).toBe(expected.TeamColorHex)
	})
})
