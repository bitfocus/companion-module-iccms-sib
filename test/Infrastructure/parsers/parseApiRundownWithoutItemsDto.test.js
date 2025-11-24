import { parseApiRundownWithoutItemsDto } from '../../../infrastructure/parsers/parseApiRundownWithoutItemsDto.js'

describe('ApiRundownWithoutItemsDto deserialization', () => {
	test('Deserialized correctly', () => {
		// arrange
		let expected = {
			Id: 12,
			Order: 1,
			RundownName: 'Test Rundown',
			ColorHex: '#FF0000',
			IconId: 'icon123',
			SvgIcon: 'svgIconData',
		}

		// act
		const actual = parseApiRundownWithoutItemsDto(expected)

		// assert
		expect(actual.Id).toBe(expected.Id)
		expect(actual.Order).toBe(expected.Order)
		expect(actual.RundownName).toBe(expected.RundownName)
		expect(actual.ColorHex).toBe(expected.ColorHex)
		expect(actual.IconId).toBe(expected.IconId)
		expect(actual.SvgIcon).toBe(expected.SvgIcon)
	})

	test('Returns null for invalid input', () => {
		// arrange
		const invalidInput = null

		// act
		const actual = parseApiRundownWithoutItemsDto(invalidInput)

		// assert
		expect(actual).toBeNull()
	})
})
