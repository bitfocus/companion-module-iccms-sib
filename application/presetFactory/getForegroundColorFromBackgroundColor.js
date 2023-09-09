/**
 * Gets foreground color to match background color.
 * @param {number} bgColor
 * @returns {number}
 */
export function getForegroundColorFromBackgroundColor(bgColor) {
	const clrBlack = 0
	const clrWhite = 16777215

	if (bgColor === 16711680) {
		return clrWhite
	} else if (bgColor === 16751001) {
		return clrWhite
	} else {
		return clrBlack
	}
}
