import { parseGroupsWithButtons } from '../../../infrastructure/acl/parseGroupsWithButtons.js'

describe('apiQuickButtonGroupWithButtons deserialization', () => {
	test('Deserialized with buttons', () => {
		// arrange
		let expected = {
			Id: 10,
			CollectionId: 0,
			Order: 11,
			ButtonText: 'Group',
			BackgroundColorHex: '#000001',
			IconId: 'folder',
			SvgIcon: 'icon_1',
			Buttons: [
				{
					Id: 30,
					EventId: 30,
					ButtonId: '00000000-0000-0000-0000-000000000001',
					ButtonText: 'Button text',
					Order: 0,
					BackgroundColorHex: '#000002',
					IconId: 'action',
					SvgIcon: 'icon_1',
				},
			],
		}

		// act
		const actual = parseGroupsWithButtons(expected)
		const actualButton = actual.Buttons[0]

		// assert

		// group
		expect(actual.Id).toBe(expected.Id)
		expect(actual.CollectionId).toBe(expected.CollectionId)
		expect(actual.Order).toBe(expected.Order)
		expect(actual.ButtonText).toBe(expected.ButtonText)
		expect(actual.BackgroundColorHex).toBe(expected.BackgroundColorHex)
		expect(actual.IconId).toBe(expected.IconId)
		expect(actual.SvgIcon).toBe(expected.SvgIcon)

		// Buttons
		expect(actualButton.Id).toBe(expected.Buttons[0].Id)
		expect(actualButton.EventId).toBe(expected.Buttons[0].EventId)
		expect(actualButton.ButtonId).toBe(expected.Buttons[0].ButtonId)
		expect(actualButton.ButtonText).toBe(expected.Buttons[0].ButtonText)
		expect(actualButton.Order).toBe(expected.Buttons[0].Order)
		expect(actualButton.BackgroundColorHex).toBe(expected.Buttons[0].BackgroundColorHex)
		expect(actualButton.IconId).toBe(expected.Buttons[0].IconId)
		expect(actualButton.SvgIcon).toBe(expected.Buttons[0].SvgIcon)
	})
})
