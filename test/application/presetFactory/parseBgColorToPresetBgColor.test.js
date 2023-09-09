import { parseBgColorToPresetBgColor } from '../../../application/presetFactory/parseBgColorToPresetBgColor.js'
import { combineRgb } from '@companion-module/base'

describe('Test parse QB background HEX colors', () => {
	const defBackground = 16711680
	const defForeground = 16777215

	test('Companion default background', () => {
		const clrBg = combineRgb(255, 0, 0)
		expect(clrBg).toBe(defBackground)
	})
	test('Companion default foreground', () => {
		const clrBg = combineRgb(255, 255, 255)
		expect(clrBg).toBe(defForeground)
	})

	it.each([
		['#000000', defBackground],
		['#00000000', defBackground],
		['#838383FF', defBackground],
		['#FF9999', 16751001],
		['#FFCC99', 16764057],
		['#FFFF99', 16777113],
		['#99FF99', 10092441],
		['#99CCFF', 10079487],
		['#CC99FF', 13408767],
		['#FF99FE', 16751102],
	])('Hext color %s, mapped to %d', (hexColor, expectedClr) => {
		const actualClr = parseBgColorToPresetBgColor(hexColor)

		expect(actualClr).toBe(expectedClr)
	})
})
