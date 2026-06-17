import { combineRgb } from '@companion-module/base'
// import { colord } from 'colord'

/**
 * Gets foreground color (black or white) for best contrast against the given background color.
 * Uses colord perceived brightness to determine if background is dark or light.
 * @param {string} bgColorHex - Background color as hex string from SIB API (e.g. '#FF9999').
 * @returns {number} White for dark backgrounds, black for light backgrounds.
 */
export function getForegroundColorFromBackgroundColor(bgColorHex) {
	// return colord(bgColorHex).isDark() ? combineRgb(255, 255, 255) : combineRgb(0, 0, 0)
	return combineRgb(255, 255, 255)
}
