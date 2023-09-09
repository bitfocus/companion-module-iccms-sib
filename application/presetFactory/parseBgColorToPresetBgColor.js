import { combineRgb } from '@companion-module/base'
import { colord } from 'colord'

/**
 * @summary
 * Parses SIB background color from hex with or without alpha.
 *
 * @description
 * Here, you can override sib colors with own.
 *
 * defaultStyle:
 *  bgcolor: combineRgb(255, 0, 0),
 *  color: combineRgb(255, 255, 255),
 *
 * @param clrHex
 * @returns {number} Result is used to set  color instead of companion combineRgb(255, 0, 0).
 */
export function parseBgColorToPresetBgColor(clrHex) {
	let bgClrInt

	if (clrHex == null || (typeof clrHex === 'string' && clrHex.trim().length === 0)) {
		// default bg is combineRgb(255, 0, 0).
		bgClrInt = combineRgb(255, 0, 0)
	} else if (clrHex === '#990000') {
		bgClrInt = combineRgb(255, 0, 0)
	} else if (clrHex === '#990000FF') {
		bgClrInt = combineRgb(255, 0, 0)
	} else if (clrHex === '#00FFFFFF') {
		bgClrInt = combineRgb(255, 0, 0)
	} else if (clrHex === '#000000') {
		bgClrInt = combineRgb(255, 0, 0)
	} else if (clrHex === '#00000000') {
		bgClrInt = combineRgb(255, 0, 0)
	} else if (clrHex === '#838383') {
		bgClrInt = combineRgb(255, 0, 0)
	} else if (clrHex === '#838383FF') {
		bgClrInt = combineRgb(255, 0, 0)
	} else if (clrHex === '#000000') {
		bgClrInt = combineRgb(255, 0, 0)
	} else {
		let clr = colord(clrHex).toRgb()

		bgClrInt = combineRgb(clr.r, clr.g, clr.b)
	}
	return bgClrInt
}
