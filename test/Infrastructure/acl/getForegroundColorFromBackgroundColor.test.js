import { getForegroundColorFromBackgroundColor } from '../../../application/presetFactory/getForegroundColorFromBackgroundColor.js'

describe('Test get QB foreground background colors', () => {
	const defBackground = 16711680
	const clrBlack = 0
	const clrWhite = 16777215

	it.each([
		[defBackground, clrWhite],
		[16751001, clrWhite],
		[16764057, clrBlack],
		[16777113, clrBlack],
		[10092441, clrBlack],
		[10079487, clrBlack],
		[13408767, clrBlack],
		[16751102, clrBlack],
	])('bg color %d, converted to fore color mapped to %d', (bgColor, expectedClr) => {
		const actualClr = getForegroundColorFromBackgroundColor(bgColor)

		// black = 0
		expect(actualClr).toBe(expectedClr)
	})
})
