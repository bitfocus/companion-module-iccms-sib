import { apiQuickButtonInGroup } from '../../../src/infrastructure/sib-api/apiQuickButtonInGroup.js'

describe('apiQuickButtonInGroup', () => {
	test('new instance has correct default values', () => {
		// arrange + act
		const actual = new apiQuickButtonInGroup()

		// assert
		expect(actual).toBeInstanceOf(apiQuickButtonInGroup)
		expect(actual.Id).toBe(0)
		expect(actual.EventId).toBe(0)
		expect(actual.ButtonId).toBe('')
		expect(actual.ButtonText).toBe('')
		expect(actual.Order).toBe(0)
		expect(actual.BackgroundColorHex).toBe('')
		expect(actual.IconId).toBe('')
		expect(actual.SvgIcon).toBe('')
	})
})
