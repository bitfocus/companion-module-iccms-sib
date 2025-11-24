import { parseApiRundownWithoutItemsArray } from '../../../infrastructure/parsers/parseApiRundownWithoutItemsArray.js'

describe('ApiRundownWithoutItemsArray deserialization', () => {
	test('Deserialized correctly', () => {
		// arrange
		const input = [
			{
				Id: 1,
				Order: 1,
				RundownName: 'Rundown 1',
				ColorHex: '#FF0000',
				IconId: 'icon1',
				SvgIcon: 'svgIcon1',
			},
			{
				Id: 2,
				Order: 2,
				RundownName: 'Rundown 2',
				ColorHex: '#00FF00',
				IconId: 'icon2',
				SvgIcon: 'svgIcon2',
			},
		]

		// act
		const actual = parseApiRundownWithoutItemsArray(input)

		// assert
		expect(actual).not.toBeNull()
		expect(actual.Rundowns.length).toBe(2)
		expect(actual.Rundowns[0].Id).toBe(1)
		expect(actual.Rundowns[1].RundownName).toBe('Rundown 2')
	})

	test('Returns null for invalid input', () => {
		// arrange
		const invalidInput = null

		// act
		const actual = parseApiRundownWithoutItemsArray(invalidInput)

		// assert
		expect(actual).toBeNull()
	})
})
