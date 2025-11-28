import { SibIcons } from '../../../domain/sibIcons.js'
import { apiQuickButtonInGroup } from '../../../infrastructure/sib-api/apiQuickButtonInGroup.js'
import { apiQuickButtonGroupWithButtons } from '../../../infrastructure/sib-api/apiQuickButtonGroupWithButtons.js'
import { apiQuickButtonCollectionWithGroupsAndButtons } from '../../../infrastructure/sib-api/apiQuickButtonCollectionWithGroupsAndButtons.js'
import { createPresetsFromCollectionsWithGroupsAndButtons } from '../../../application/presetFactory/createPresetsFromCollectionsWithGroupsAndButtons.js'

describe('Create preset from collection with groups and buttons', () => {
	test('Collection, Group has buttons, button is created.', () => {
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
		const actual = createPresetsFromCollectionsWithGroupsAndButtons(apiColArray, sibIcons)

		// assert
		const actualKeys = Object.keys(actual)
		// Now creates hierarchical structure: group button, header, and individual button
		expect(actualKeys).toHaveLength(3)
		expect(actualKeys).toContain('group_111_11')
		expect(actualKeys).toContain('header_111_11')
		expect(actualKeys).toContain('preset_qb_1')
		
		// Verify group button
		expect(actual['group_111_11'].type).toBe('button')
		expect(actual['group_111_11'].category).toBe('QuickButtons/c_text')
		
		// Verify header
		expect(actual['header_111_11'].type).toBe('text')
		expect(actual['header_111_11'].category).toBe('QuickButtons/c_text/g_text')
		
		// Verify individual button
		expect(actual['preset_qb_1'].type).toBe('button')
		expect(actual['preset_qb_1'].category).toBe('QuickButtons/c_text/g_text')
	})

	test('Collection, Group has no buttons, preset is not created.', () => {
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
		const actual = createPresetsFromCollectionsWithGroupsAndButtons(apiColArray, sibIcons)

		// assert
		const actualKeys = Object.keys(actual)
		expect(actualKeys).toEqual(expect.any(Array))
	})

	test('Collection, no groups and no buttons, preset is not created.', () => {
		// arrange
		const sibIcons = new SibIcons()
		// collections
		let apiC = new apiQuickButtonCollectionWithGroupsAndButtons()

		apiC.Id = 111
		apiC.CollectionType = 1
		apiC.Text = 'c_text'
		apiC.Order = 1
		apiC.BackgroundColorHex = ''
		apiC.IconId = 'iconId'
		apiC.SvgIcon = ''
		apiC.Groups = []

		const apiColArray = []
		apiColArray.push(apiC)

		// act
		const actual = createPresetsFromCollectionsWithGroupsAndButtons(apiColArray, sibIcons)

		// assert
		const actualKeys = Object.keys(actual)
		expect(actualKeys).toEqual(expect.any(Array))
	})
})
