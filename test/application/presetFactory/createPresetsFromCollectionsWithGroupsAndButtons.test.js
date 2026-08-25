import { vi } from 'vitest'
import { composeIconWithGradient } from '../../../src/domain/imageProcessing.js'
import { SibIcons } from '../../../src/domain/sibIcons.js'
import { apiQuickButtonInGroup } from '../../../src/infrastructure/sib-api/apiQuickButtonInGroup.js'
import { apiQuickButtonGroupWithButtons } from '../../../src/infrastructure/sib-api/apiQuickButtonGroupWithButtons.js'
import { apiQuickButtonCollectionWithGroupsAndButtons } from '../../../src/infrastructure/sib-api/apiQuickButtonCollectionWithGroupsAndButtons.js'
import { createPresetsFromCollectionsWithGroupsAndButtons } from '../../../src/application/presetFactory/createPresetsFromCollectionsWithGroupsAndButtons.js'

vi.mock('../../../src/domain/imageProcessing.js', () => ({
	composeIconWithGradient: vi.fn(),
}))

describe('Create preset from collection with groups and buttons', () => {
	beforeEach(() => {
		composeIconWithGradient.mockReturnValue('composed-icon')
	})
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
		expect(actualKeys).toHaveLength(3)
		expect(actualKeys).toContain('collection_header_111')
		expect(actualKeys).toContain('group_header_111_11')
		expect(actualKeys).toContain('button_111_11_1')

		// Verify the collection header
		expect(actual['collection_header_111'].type).toBe('text')
		expect(actual['collection_header_111'].category).toBe('Pages/c_text')

		// Verify group header
		expect(actual['group_header_111_11'].type).toBe('text')
		expect(actual['group_header_111_11'].category).toBe('Pages/c_text')

		// Verify individual button
		expect(actual['button_111_11_1'].type).toBe('button')
		expect(actual['button_111_11_1'].category).toBe('Pages/c_text')
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
		expect(actualKeys).toHaveLength(2)
		expect(actualKeys).toContain('collection_header_111')
		expect(actualKeys).toContain('group_header_111_11')
	})

	test('composes icon once when two buttons share the same iconId', () => {
		// arrange
		const sibIcons = {
			hasIcon: vi.fn((id) => id === 'shared-icon'),
			getIconPngBase64: vi.fn((id) => (id === 'shared-icon' ? 'raw-icon-data' : '')),
		}

		function makeButton(id) {
			const btn = new apiQuickButtonInGroup()
			btn.Id = id
			btn.EventId = id
			btn.ButtonId = String(id)
			btn.ButtonText = `Button ${id}`
			btn.Order = 0
			btn.BackgroundColorHex = ''
			btn.IconId = 'shared-icon'
			btn.SvgIcon = ''
			return btn
		}

		const grp = new apiQuickButtonGroupWithButtons()
		grp.Id = 1
		grp.CollectionType = 1
		grp.ButtonText = 'Group'
		grp.Order = 0
		grp.BackgroundColorHex = ''
		grp.IconId = ''
		grp.SvgIcon = ''
		grp.Buttons = [makeButton(1), makeButton(2)]

		const col = new apiQuickButtonCollectionWithGroupsAndButtons()
		col.Id = 10
		col.CollectionType = 1
		col.Text = 'Col'
		col.Order = 0
		col.BackgroundColorHex = ''
		col.IconId = ''
		col.SvgIcon = ''
		col.Groups = [grp]

		// act
		const actual = createPresetsFromCollectionsWithGroupsAndButtons([col], sibIcons)

		// assert - both buttons get the composed icon
		expect(actual['button_10_1_1'].style.png64).toBe('composed-icon')
		expect(actual['button_10_1_2'].style.png64).toBe('composed-icon')

		// composed once for the shared iconId, not once per button
		expect(composeIconWithGradient).toHaveBeenCalledTimes(1)
		expect(composeIconWithGradient).toHaveBeenCalledWith('raw-icon-data')
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
		expect(actualKeys).toHaveLength(1)
		expect(actualKeys).toContain('collection_header_111')
	})
})
