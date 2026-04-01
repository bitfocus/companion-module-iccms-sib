import { combineRgb } from '@companion-module/base'

/**
 * Gets foreground color (black or white) for best contrast against the given background color.
 * Uses relative luminance (ITU-R BT.709) to determine if background is dark or light.
 * @param {number} bgColor - Background color as combineRgb integer.
 * @returns {number} White for dark backgrounds, black for light backgrounds.
 */
export function getForegroundColorFromBackgroundColor(bgColor) {
	const r = (bgColor >> 16) & 0xff
	const g = (bgColor >> 8) & 0xff
	const b = bgColor & 0xff

	// Relative luminance (ITU-R BT.709)
	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

	return luminance > 140 ? combineRgb(0, 0, 0) : combineRgb(255, 255, 255)
}
