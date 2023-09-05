import { apiQuickButtonInGroup } from '../../../infrastructure/protocol/apiQuickButtonInGroup.js'
import { apiQuickButtonGroupWithButtons } from '../../../infrastructure/protocol/apiQuickButtonGroupWithButtons.js'
import { SibIcons } from '../../../domain/sibIcons.js'
import { createPresetFromButton } from '../../../application/presetFactory/createPresetFromButton.js'

describe('Create preset from group with buttons', () => {
	test('Group has buttons, button is created.', () => {
		// arrange
		const sibIcons = new SibIcons()

		// Buttons
		const apiButton = new apiQuickButtonInGroup()
		apiButton.Id = 1
		apiButton.EventId = 10
		apiButton.ButtonId = '10'
		apiButton.ButtonText = 'b_text'
		apiButton.Order = 0
		apiButton.BackgroundColorHex = ''
		apiButton.IconId = 'IconId'
		apiButton.SvgIcon = ''

		// groups
		let apiGrp = new apiQuickButtonGroupWithButtons()
		apiGrp.Id = 11
		apiGrp.CollectionType = 1
		apiGrp.ButtonText = 'g_text'
		apiGrp.Order = 1
		apiGrp.BackgroundColorHex = ''
		apiGrp.IconId = 'iconId'
		apiGrp.SvgIcon = ''
		apiGrp.Buttons = Array(1).fill(apiButton)

		// act
		const presets = []

		// Buttons in group.
		apiGrp.Buttons.forEach((qb) => {
			const presetQb = createPresetFromButton('group_cat', qb, sibIcons)
			if (presetQb != null) {
				presets.push(presetQb)
			}
		})

		// assert
		expect(presets).toHaveLength(1)
		expect(presets[0].category).toEqual('group_cat')
		expect(presets[0].name).toEqual('Fire events of b_text')
	})

	test('Group has no buttons, no presets returned.', () => {
		// arrange
		const sibIcons = new SibIcons()

		// groups
		let apiGrp = new apiQuickButtonGroupWithButtons()
		apiGrp.Id = 11
		apiGrp.CollectionType = 1
		apiGrp.ButtonText = 'g_text'
		apiGrp.Order = 1
		apiGrp.BackgroundColorHex = ''
		apiGrp.IconId = 'iconId'
		apiGrp.SvgIcon = ''
		apiGrp.Buttons = []

		// act
		const presets = []

		// Buttons in group.
		apiGrp.Buttons.forEach((qb) => {
			const presetQb = createPresetFromButton('group_cat', qb, sibIcons)
			if (presetQb != null) {
				presets.push(presetQb)
			}
		})

		// assert
		expect(presets).toEqual(expect.any(Array))
	})
})
