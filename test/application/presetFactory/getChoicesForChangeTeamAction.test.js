import { getChoicesForChangeTeamAction } from '../../../application/presetFactory/getChoicesForChangeTeamAction.js'

describe('Choices are created from teams', () => {
	test('Choices fort collection with three teams are correct.', () => {
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
			Id: 5,
			Name: 'Team Five',
			ShortName: 'T-FIVE',
			LogoBase64: 'logo_64_2',
			LogoSmallBase64: 'logo_small_64_2',
			TeamColorHex: '#F2EA44FF',
		}

		let lst = []
		lst.push(expected1)
		lst.push(expected2)

		// act
		const actual = getChoicesForChangeTeamAction(lst)

		// assert
		const actualKeys = Object.keys(actual)
		expect(actualKeys).toHaveLength(3)
	})

	test('Default choice is returned when there are no teams.', () => {
		// arrange
		let lst = []

		// act
		const actual = getChoicesForChangeTeamAction(lst)

		// assert
		const actualKeys = Object.keys(actual)
		expect(actualKeys).toHaveLength(1)

		const expected = { id: -1, label: 'No teams' }

		expect(actual).toContainEqual(expected)
	})

	test('Team choice has correct values.', () => {
		// arrange
		let expected1 = {
			Id: 4,
			Name: 'Team Arlen',
			ShortName: 'T-Arl',
			LogoBase64: 'logo_64',
			LogoSmallBase64: 'logo_small_64',
			TeamColorHex: '#F2EA35FF',
		}

		let lst = []
		lst.push(expected1)

		// act
		const actual = getChoicesForChangeTeamAction(lst)

		// assert
		const actualKeys = Object.keys(actual)
		expect(actualKeys).toHaveLength(2)

		const expected = { id: expected1.Id, label: expected1.Name }

		expect(actual).toContainEqual(expected)
	})
})
