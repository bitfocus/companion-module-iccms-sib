import { apiQuickButtonInGroup } from '../../../infrastructure/protocol/apiQuickButtonInGroup.js'
import { SibIcons } from '../../../domain/sibIcons.js'
import { createPresetFromButton } from '../../../application/presetFactory/createPresetFromButton.js'
import { actionId } from '../../../application/actionId.js'

describe('Create preset from button', () => {
	test('Default values', () => {
		// arrange
		const sibIcons = new SibIcons()

		const apiButton = new apiQuickButtonInGroup()
		apiButton.Id = 1
		apiButton.EventId = 10
		apiButton.ButtonId = '100'
		apiButton.ButtonText = 'b_text'
		apiButton.Order = 2
		apiButton.BackgroundColorHex = '#FF9999'
		apiButton.IconId = 'IconId'
		apiButton.SvgIcon = ''

		// act
		const actual = createPresetFromButton('parent_id', apiButton, sibIcons)

		// assert
		expect(actual['type']).toBe('button')
		expect(actual['category']).toBe('parent_id')
		expect(actual['name']).toBe(`Fire events of ${apiButton.ButtonText}`)

		// style
		expect(actual.style['text']).toBe('b_text')
		expect(actual.style['color']).toBe(16777215)
		expect(actual.style['bgcolor']).toBe(16751001)

		// steps

		// up
		expect(actual.steps[0].down[0].actionId).toBe(actionId.TriggerEvent)
		expect(actual.steps[0].down[0].options[actionId.TriggerEvent]).toBe(apiButton.Id)

		// down
		expect(actual.steps[0].up).toEqual(expect.any(Array))

		// feedbacks
		expect(actual.feedbacks).toEqual(expect.any(Array))
	})
})
