import { getForegroundColorFromBackgroundColor } from '../../../application/presetFactory/getForegroundColorFromBackgroundColor.js'

describe('Test get QB foreground background colors', () => {
	const clrBlack = 0
	const clrWhite = 16777215

	it.each([
		['#FF0000', clrWhite],
		['#FF9999', clrBlack], // light pink — black text for contrast
		['#FFE799', clrBlack],
		['#FFFF99', clrBlack],
		['#99FF99', clrBlack],
		['#99CCFF', clrBlack],
		['#CCCCFF', clrBlack],
		['#FF997E', clrBlack],
	])('bg color %s, converted to fore color mapped to %d', (bgColorHex, expectedClr) => {
		const actualClr = getForegroundColorFromBackgroundColor(bgColorHex)

		// black = 0
		expect(actualClr).toBe(expectedClr)
	})
})
