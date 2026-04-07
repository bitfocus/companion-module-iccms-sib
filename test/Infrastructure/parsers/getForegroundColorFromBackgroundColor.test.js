import { getForegroundColorFromBackgroundColor } from '../../../application/presetFactory/getForegroundColorFromBackgroundColor.js'

describe('Test get QB foreground background colors', () => {
	const clrWhite = 16777215

	it.each([
		['#FF0000'],
		['#FF9999'],
		['#FFE799'],
		['#FFFF99'],
		['#99FF99'],
		['#99CCFF'],
		['#CCCCFF'],
		['#FF997E'],
	])('bg color %s, always returns white', (bgColorHex) => {
		const actualClr = getForegroundColorFromBackgroundColor(bgColorHex)

		expect(actualClr).toBe(clrWhite)
	})
})
