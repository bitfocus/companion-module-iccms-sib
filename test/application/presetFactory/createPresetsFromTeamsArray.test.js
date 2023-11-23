import { createPresetsFromTeamsArray } from '../../../application/presetFactory/createPresetsFromTeamsArray.js'

describe('Create preset from collection with teams', () => {
	test('Collection is handled and returned.', () => {
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
			ShortName: 'T-Five',
			LogoBase64: 'logo_64',
			LogoSmallBase64: 'logo_small_64',
			TeamColorHex: '#F2EA35FF',
		}

		let lst = []
		lst.push(expected1)
		lst.push(expected2)

		// act
		const actual = createPresetsFromTeamsArray(lst)

		// assert
		const actualKeys = Object.keys(actual)
		expect(actualKeys).toHaveLength(4)
	})

	test('Collection, no teams, preset is not created.', () => {
		// arrange
		let lst = []

		// act
		const actual = createPresetsFromTeamsArray(lst)

		// assert
		expect(actual).toEqual({})
	})
})
