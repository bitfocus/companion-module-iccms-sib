import { SibIcons } from '../../domain/sibIcons.js'
import { apiQuickButtonCollectionWithGroupsAndButtons } from '../../infrastructure/protocol/apiQuickButtonCollectionWithGroupsAndButtons.js'
import { SibConnection } from '../../infrastructure/connection/sibConnection.js'
describe('Sib icons tests', () => {
	test.skip('Test to convert svg to png, add first image', async () => {
		// skip because requires http mock.
		const cfg = new SibConnection('', 0, '', false, false, false)

		// arrange

		const apiCollection = []

		const col1 = new apiQuickButtonCollectionWithGroupsAndButtons()
		col1.IconId = 'icon0'
		col1.SvgIcon = 'PHN2Zz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcng9IjUwIiByeT0iNTAiLz48L3N2Zz4='
		col1.Groups = []

		apiCollection.push(col1)

		const sibIcons = new SibIcons()

		// act
		await sibIcons.updateIcons(apiCollection, cfg, '')

		// assert
		const hasIcon = sibIcons.hasIcon('icon0')
		const pngBase64 = sibIcons.getIconPngBase64('icon0')

		expect(hasIcon).toBeTruthy()
		expect(pngBase64.startsWith('iVBORw0KGgoAAAANSUhEUgAAA')).toBeTruthy()
	})
})
