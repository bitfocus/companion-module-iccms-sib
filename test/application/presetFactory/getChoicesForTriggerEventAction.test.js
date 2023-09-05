import { SibIcons } from '../../../domain/sibIcons.js'
import { apiQuickButtonInGroup } from '../../../infrastructure/protocol/apiQuickButtonInGroup.js'
import { apiQuickButtonGroupWithButtons } from '../../../infrastructure/protocol/apiQuickButtonGroupWithButtons.js'
import { apiQuickButtonCollectionWithGroupsAndButtons } from '../../../infrastructure/protocol/apiQuickButtonCollectionWithGroupsAndButtons.js'
import { getChoicesForTriggerEventAction } from '../../../application/presetFactory/getChoicesForTriggerEventAction.js'

describe('Choices are created from collection with buttons', () => {
	test('Two choices are returned for collection with one button.', () => {
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

		// collections
		let apiC = new apiQuickButtonCollectionWithGroupsAndButtons()

		apiC.Id = 111
		apiC.CollectionType = 1
		apiC.Text = 'c_text'
		apiC.Order = 1
		apiC.BackgroundColorHex = ''
		apiC.IconId = 'iconId'
		apiC.SvgIcon = ''
		apiC.Groups = Array(1).fill(apiGrp)

		const apiColArray = []
		apiColArray.push(apiC)

		// act
		const actual = getChoicesForTriggerEventAction(apiColArray)

		// assert
		const actualKeys = Object.keys(actual)
		expect(actualKeys).toHaveLength(2)
	})
})
