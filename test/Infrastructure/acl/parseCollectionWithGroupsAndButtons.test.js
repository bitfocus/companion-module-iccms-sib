import { parseCollectionWithGroupsAndButtons } from '../../../infrastructure/acl/parseCollectionWithGroupsAndButtons.js'

describe('apiQuickButtonCollectionWithGroupsAndButtons deserialization', () => {
	test('Deserialized collection', () => {
		// arrange
		let expected = {
			Id: 1,
			CollectionType: 0,
			Text: 'c_text',
			Order: 10,
			BackgroundColorHex: '#000001',
			IconId: 'window',
			SvgIcon: 'svg_collection',
			Groups: [
				{
					Id: 1,
					CollectionId: 0,
					Order: 20,
					ButtonText: 'g_text',
					BackgroundColorHex: '#000002',
					IconId: 'folder',
					SvgIcon: 'svg_group',
					Buttons: [
						{
							Id: 30,
							EventId: 30,
							ButtonId: '00000000-0000-0000-0000-000000000001',
							ButtonText: 'b_text',
							Order: 30,
							BackgroundColorHex: '#000003',
							IconId: 'action',
							SvgIcon: 'svg_button',
						},
					],
					CollectionType: 1,
				},
			],
		}

		// act
		const actual = parseCollectionWithGroupsAndButtons(expected)

		// assert
		expect(actual.Id).toBe(expected.Id)
		expect(actual.CollectionType).toBe(expected.CollectionType)
		expect(actual.Text).toBe(expected.Text)
		expect(actual.Order).toBe(expected.Order)
		expect(actual.BackgroundColorHex).toBe(expected.BackgroundColorHex)
		expect(actual.IconId).toBe(expected.IconId)
		expect(actual.SvgIcon).toBe(expected.SvgIcon)
	})

	test('Deserialized group inside collection', () => {
		// arrange
		let expected = {
			Id: 1,
			CollectionType: 0,
			Text: 'c_text',
			Order: 10,
			BackgroundColorHex: '#000001',
			IconId: 'window',
			SvgIcon: 'svg_collection',
			Groups: [
				{
					Id: 1,
					CollectionId: 0,
					Order: 20,
					ButtonText: 'g_text',
					BackgroundColorHex: '#000002',
					IconId: 'folder',
					SvgIcon: 'svg_group',
					Buttons: [
						{
							Id: 30,
							EventId: 30,
							ButtonId: '00000000-0000-0000-0000-000000000001',
							ButtonText: 'b_text',
							Order: 30,
							BackgroundColorHex: '#000003',
							IconId: 'action',
							SvgIcon: 'svg_button',
						},
					],
					CollectionType: 1,
				},
			],
		}

		const expectedGroup = expected.Groups[0]

		// act
		const actual = parseCollectionWithGroupsAndButtons(expected)
		const actualGroup = actual.Groups[0]

		// assert
		expect(actualGroup.Id).toBe(expectedGroup.Id)
		expect(actualGroup.CollectionId).toBe(expectedGroup.CollectionId)
		expect(actualGroup.Order).toBe(expectedGroup.Order)
		expect(actualGroup.ButtonText).toBe(expectedGroup.ButtonText)
		expect(actualGroup.BackgroundColorHex).toBe(expectedGroup.BackgroundColorHex)
		expect(actualGroup.IconId).toBe(expectedGroup.IconId)
		expect(actualGroup.SvgIcon).toBe(expectedGroup.SvgIcon)
	})

	test('Deserialized button inside group inside collection', () => {
		// arrange
		let expected = {
			Id: 1,
			CollectionType: 0,
			Text: 'c_text',
			Order: 10,
			BackgroundColorHex: '#000001',
			IconId: 'window',
			SvgIcon: 'svg_collection',
			Groups: [
				{
					Id: 1,
					CollectionId: 0,
					Order: 20,
					ButtonText: 'g_text',
					BackgroundColorHex: '#000002',
					IconId: 'folder',
					SvgIcon: 'svg_group',
					Buttons: [
						{
							Id: 30,
							EventId: 30,
							ButtonId: '00000000-0000-0000-0000-000000000001',
							ButtonText: 'b_text',
							Order: 30,
							BackgroundColorHex: '#000003',
							IconId: 'action',
							SvgIcon: 'svg_button',
						},
					],
					CollectionType: 1,
				},
			],
		}

		const expectedButton = expected.Groups[0].Buttons[0]

		// act
		const actual = parseCollectionWithGroupsAndButtons(expected)
		const actualButton = actual.Groups[0].Buttons[0]

		// assert
		expect(actualButton.Id).toBe(expectedButton.Id)
		expect(actualButton.EventId).toBe(expectedButton.EventId)
		expect(actualButton.ButtonId).toBe(expectedButton.ButtonId)
		expect(actualButton.ButtonText).toBe(expectedButton.ButtonText)
		expect(actualButton.Order).toBe(expectedButton.Order)
		expect(actualButton.BackgroundColorHex).toBe(expectedButton.BackgroundColorHex)
		expect(actualButton.IconId).toBe(expectedButton.IconId)
		expect(actualButton.SvgIcon).toBe(expectedButton.SvgIcon)
	})
})
