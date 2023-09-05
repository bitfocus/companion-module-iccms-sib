import { parseButtonInGroup } from '../../../infrastructure/acl/parseButtonInGroup.js'

describe('apiQuickButtonInGroup deserialization', () => {
	test('Deserialized correctly', () => {
		// arrange
		let expected = {
			Id: 34,
			EventId: 35,
			ButtonId: '00000000-0000-0000-0000-000000000001',
			ButtonText: 'Button 34',
			Order: 4,
			IconId: 'action',
			BackgroundColorHex: '#FFFF99',
			Shortcut: 'SHORTCUT',
			SvgIcon: 'ICON',
		}

		// act
		const actual = parseButtonInGroup(expected)

		// assert
		expect(actual.Id).toBe(expected.Id)
		expect(actual.EventId).toBe(expected.EventId)
		expect(actual.ButtonId).toBe(expected.ButtonId)
		expect(actual.ButtonText).toBe(expected.ButtonText)
		expect(actual.Order).toBe(expected.Order)
		expect(actual.BackgroundColorHex).toBe(expected.BackgroundColorHex)
		expect(actual.IconId).toBe(expected.IconId)
		expect(actual.SvgIcon).toBe(expected.SvgIcon)
	})
})
