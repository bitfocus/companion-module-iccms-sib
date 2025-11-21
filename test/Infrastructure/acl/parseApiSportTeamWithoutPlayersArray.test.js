import { parseApiSportTeamWithoutPlayersArray } from '../../../infrastructure/acl/parseApiSportTeamWithoutPlayersArray.js'

describe('ApiSportTeamWithoutPlayers array deserialization', () => {
	test('Deserialized correctly', () => {
		// arrange
		let expected1 = {
			Id: 4,
			Name: 'Team Arlen',
			ShortName: 'T-Arl',
			LogoBase64: 'logo_64',
			LogoSmallBase64: 'logo_small_64',
			TeamColorHex: '#F2EA35FF',
		}
		let expected2 = {
			Id: 4,
			Name: 'Team Arlen',
			ShortName: 'T-Arl',
			LogoBase64: 'logo_64',
			LogoSmallBase64: 'logo_small_64',
			TeamColorHex: '#F2EA35FF',
		}

		let lst = []
		lst.push(expected1)
		lst.push(expected2)

		// act
		const actual = parseApiSportTeamWithoutPlayersArray(lst)

		// assert
		expect(actual.length).toBe(2)
	})
})
