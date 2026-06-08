import { parseApiRundownWithoutItemsArray } from '../../../infrastructure/parsers/parseApiRundownWithoutItemsArray.js'

describe('ApiRundownWithoutItemsArray deserialization', () => {
	test('Deserialized correctly', () => {
		// arrange
		const input = [
      {
        "Id": 7,
        "Order": 1,
        "Name": "Id 7 - LightCoral",
        "ColorHex": "#FF9999",
        "IconId": "rundown"
      },
      {
        "Id": 6,
        "Order": 2,
        "Name": "Id 5 - Rundown - Grey",
        "ColorHex": "#000000",
        "IconId": "rundown"
      }
    ]

		// act
		const actual = parseApiRundownWithoutItemsArray(input)

		// assert
		expect(actual).not.toBeNull()
		expect(actual.Rundowns.length).toBe(2)
		expect(actual.Rundowns[0].Id).toBe(7)
		expect(actual.Rundowns[0].Order).toBe(1)
		expect(actual.Rundowns[0].ColorHex).toBe('#FF9999')
		expect(actual.Rundowns[0].IconId).toBe('rundown')
		expect(actual.Rundowns[0].RundownName).toBe('Id 7 - LightCoral')
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
