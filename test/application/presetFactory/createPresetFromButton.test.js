import { composeIconWithGradient } from '../../../src/domain/imageProcessing.js'
import { apiQuickButtonInGroup } from '../../../src/infrastructure/sib-api/apiQuickButtonInGroup.js'
import { SibIcons } from '../../../src/domain/sibIcons.js'
import { createPresetFromButton } from '../../../src/application/presetFactory/createPresetFromButton.js'
import { actionId } from '../../../src/application/actionId.js'

vi.mock('../../../src/domain/imageProcessing.js', () => ({
	composeIconWithGradient: vi.fn(),
}))

describe('Create preset from button', () => {
	beforeEach(() => {
		composeIconWithGradient.mockReturnValue('composed-icon')
	})

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
		expect(actual.style['color']).toBe(16777215) // always white
		expect(actual.style['bgcolor']).toBe(16751001)

		// steps

		// up
		expect(actual.steps[0].down[0].actionId).toBe(actionId.TriggerEvent)
		expect(actual.steps[0].down[0].options[actionId.TriggerEvent]).toBe(apiButton.EventId)

		// down
		expect(actual.steps[0].up).toEqual(expect.any(Array))

		// feedbacks
		expect(actual.feedbacks).toEqual(expect.any(Array))
	})

	test('sets png64 from composeIconWithGradient result when compose succeeds', () => {
		// arrange
		const sibIcons = {
			hasIcon: vi.fn(() => true),
			getIconPngBase64: vi.fn(() => 'raw-icon-data'),
		}
		const apiButton = new apiQuickButtonInGroup()
		apiButton.IconId = 'icon-1'
		apiButton.BackgroundColorHex = '#000000'

		// act
		const actual = createPresetFromButton('parent_id', apiButton, sibIcons)

		// assert
		expect(composeIconWithGradient).toHaveBeenCalledWith('raw-icon-data')
		expect(actual.style.png64).toBe('composed-icon')
	})

	test('does not set png64 when composeIconWithGradient returns empty string (compose error)', () => {
		// arrange
		composeIconWithGradient.mockReturnValue('')
		const sibIcons = {
			hasIcon: vi.fn(() => true),
			getIconPngBase64: vi.fn(() => 'raw-icon-data'),
		}
		const apiButton = new apiQuickButtonInGroup()
		apiButton.IconId = 'icon-1'
		apiButton.BackgroundColorHex = '#000000'

		// act
		const actual = createPresetFromButton('parent_id', apiButton, sibIcons)

		// assert
		expect(actual.style.png64).toBeUndefined()
	})
})
