import { SibIcons } from '../../src/domain/sibIcons.js'
import { apiQuickButtonCollectionWithGroupsAndButtons } from '../../src/infrastructure/sib-api/apiQuickButtonCollectionWithGroupsAndButtons.js'
import { SibConnection } from '../../src/infrastructure/connection/sibConnection.js'
import { sibHttpClientGetPngIconBase64 } from '../../src/infrastructure/connection/sibHttpClient.js'

vi.mock('../../src/infrastructure/connection/sibHttpClient.js', () => ({
	sibHttpClientGetPngIconBase64: vi.fn(async () => 'iVBORw0KGgoAAAANSUhEUgAAA'),
	SibRateLimitError: class SibRateLimitError extends Error {},
}))

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

	describe('Version gate', () => {
		test('Skips fetching when SIB version is older than the icon API version', async () => {
			// arrange
			const cfg = new SibConnection('', 0, '', false, false, false)
			const sibIcons = new SibIcons()

			// act
			const result = await sibIcons.updateIcons(['icon0'], cfg, '2.14.9999')

			// assert
			expect(result).toBe(true)
			expect(sibHttpClientGetPngIconBase64).not.toHaveBeenCalled()
			expect(sibIcons.cachedCount).toBe(0)
		})

		test('Fetches icons on the exact version that introduced the icon API (regression)', async () => {
			// arrange
			const cfg = new SibConnection('', 0, '', false, false, false)
			const sibIcons = new SibIcons()

			// act
			await sibIcons.updateIcons(['icon0'], cfg, '2.15.8630')

			// assert
			expect(sibHttpClientGetPngIconBase64).toHaveBeenCalled()
			expect(sibIcons.hasIcon('icon0')).toBe(true)
		})

		test('Fetches icons on a newer version', async () => {
			// arrange
			const cfg = new SibConnection('', 0, '', false, false, false)
			const sibIcons = new SibIcons()

			// act
			await sibIcons.updateIcons(['icon0'], cfg, '2.16.0')

			// assert
			expect(sibHttpClientGetPngIconBase64).toHaveBeenCalled()
			expect(sibIcons.hasIcon('icon0')).toBe(true)
		})

		test('Fetches icons on a non-standard 4-segment version (2.21.2.216)', async () => {
			// arrange
			const cfg = new SibConnection('', 0, '', false, false, false)
			const sibIcons = new SibIcons()

			// act
			await sibIcons.updateIcons(['icon0'], cfg, '2.21.2.216')

			// assert
			expect(sibHttpClientGetPngIconBase64).toHaveBeenCalled()
			expect(sibIcons.hasIcon('icon0')).toBe(true)
		})

		test('Fetches icons when the version is empty / unparseable', async () => {
			// arrange
			const cfg = new SibConnection('', 0, '', false, false, false)
			const sibIcons = new SibIcons()

			// act
			await sibIcons.updateIcons(['icon0'], cfg, '')

			// assert
			expect(sibHttpClientGetPngIconBase64).toHaveBeenCalled()
		})
	})
})
