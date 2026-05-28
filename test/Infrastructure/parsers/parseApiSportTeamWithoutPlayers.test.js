import { parseApiSportTeamWithoutPlayers } from '../../../infrastructure/parsers/parseApiSportTeamWithoutPlayers.js'

describe('ApiSportTeamWithoutPlayers deserialization', () => {
	test('Deserialized correctly', () => {
		// arrange
		let expected = {
			Id: 4,
			Name: 'Team Arlen',
			ShortName: 'T-Arl',
			TeamColorHex: '#F2EA35FF',
		}

		// act
		const actual = parseApiSportTeamWithoutPlayers(expected)

		// assert
		expect(actual.Id).toBe(expected.Id)
		expect(actual.Name).toBe(expected.Name)
		expect(actual.ShortName).toBe(expected.ShortName)
		expect(actual.TeamColorHex).toBe(expected.TeamColorHex)
	})
})
