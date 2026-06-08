import { PNG } from 'pngjs'
import { composeIconWithGradient } from '../../domain/imageProcessing.js'

/**
 * Creates a solid-color test PNG as base64.
 * @param {number} width
 * @param {number} height
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} base64-encoded PNG
 */
function createTestPng(width, height, r, g, b) {
	const png = new PNG({ width, height })
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4
			png.data[idx] = r
			png.data[idx + 1] = g
			png.data[idx + 2] = b
			png.data[idx + 3] = 255
		}
	}
	return PNG.sync.write(png).toString('base64')
}

function decodeResult(base64) {
	return PNG.sync.read(Buffer.from(base64, 'base64'))
}

function getPixel(decoded, x, y) {
	const idx = (y * decoded.width + x) * 4
	return {
		r: decoded.data[idx],
		g: decoded.data[idx + 1],
		b: decoded.data[idx + 2],
		a: decoded.data[idx + 3],
	}
}

describe('composeIconWithGradient', () => {
	test('returns empty string for empty input', () => {
		expect(composeIconWithGradient('')).toBe('')
	})

	test('returns empty string for undefined', () => {
		expect(composeIconWithGradient(undefined)).toBe('')
	})

	test('returns empty string for null', () => {
		expect(composeIconWithGradient(null)).toBe('')
	})

	test('returns empty string for malformed base64', () => {
		expect(composeIconWithGradient('not-a-valid-png')).toBe('')
	})

	test('output is a valid 72x58 PNG', () => {
		// arrange
		const input = createTestPng(72, 72, 255, 0, 0)

		// act
		const result = composeIconWithGradient(input)

		// assert
		const decoded = decodeResult(result)
		expect(decoded.width).toBe(72)
		expect(decoded.height).toBe(58)
	})

	test('strips data URI prefix', () => {
		// arrange
		const raw = createTestPng(72, 72, 128, 0, 0)
		const withPrefix = `data:image/png;base64,${raw}`

		// act
		const result = composeIconWithGradient(withPrefix)

		// assert
		const decoded = decodeResult(result)
		expect(decoded.width).toBe(72)
		expect(decoded.height).toBe(58)
	})

	test('square input is scaled to fit icon height preserving aspect ratio', () => {
		// arrange — 36x36 scales to 39x39 (contain fit, limited by ICON_HEIGHT=39)
		const input = createTestPng(36, 36, 100, 100, 100)

		// act
		const result = composeIconWithGradient(input)

		// assert
		const decoded = decodeResult(result)
		expect(decoded.width).toBe(72)
		expect(decoded.height).toBe(58)

		// Center pixel of icon zone should carry the icon color
		const px = getPixel(decoded, 36, 5)
		expect(px.r).toBe(100)
	})

	test('tall input is contained within icon height without overflow', () => {
		// arrange — 50x200 (tall). Contain fit scales to ~10x39 so it must NOT bleed past icon zone.
		const input = createTestPng(50, 200, 0, 0, 200)

		// act
		const result = composeIconWithGradient(input)

		// assert — pixel outside the contained icon width should remain transparent above gradient
		const decoded = decodeResult(result)
		const outsideIcon = getPixel(decoded, 0, 5)
		expect(outsideIcon.a).toBe(0)

		// And the icon column near horizontal center should be visible above the gradient
		const insideIcon = getPixel(decoded, 36, 5)
		expect(insideIcon.b).toBe(200)
		expect(insideIcon.a).toBe(255)
	})

	test('wide input is contained within icon width preserving aspect ratio', () => {
		// arrange — 200x50 (wide). Contain fit scales to 44x11 so vertical center of icon zone is ~y=14.
		const input = createTestPng(200, 50, 200, 0, 0)

		// act
		const result = composeIconWithGradient(input)

		// assert — pixel above the vertically-centered icon strip should be transparent
		const decoded = decodeResult(result)
		const aboveIcon = getPixel(decoded, 36, 2)
		expect(aboveIcon.a).toBe(0)
	})

	test('top area above gradient is transparent', () => {
		// arrange
		const input = createTestPng(72, 72, 255, 255, 255)

		// act
		const result = composeIconWithGradient(input)

		// assert — pixel outside icon padding area, above gradient, should be transparent
		const px = getPixel(decodeResult(result), 0, 5)
		expect(px.a).toBe(0)
	})

	test('bottom row is near-opaque black', () => {
		// arrange
		const input = createTestPng(72, 72, 255, 255, 255)

		// act
		const result = composeIconWithGradient(input)

		// assert — last row near end of gradient should be near-opaque black
		const px = getPixel(decodeResult(result), 36, 57)
		expect(px.r).toBeLessThanOrEqual(20)
		expect(px.g).toBeLessThanOrEqual(20)
		expect(px.b).toBeLessThanOrEqual(20)
		expect(px.a).toBeGreaterThanOrEqual(240)
	})

	test('icon pixels are visible in top area', () => {
		// arrange — 72x72 scales to fill 44px icon width
		const input = createTestPng(72, 72, 0, 200, 0)

		// act
		const result = composeIconWithGradient(input)

		// assert — pixel (36, 5) is center of icon, above gradient
		const px = getPixel(decodeResult(result), 36, 5)
		expect(px.g).toBe(200)
		expect(px.a).toBe(255)
	})

	test('gradient increases opacity from transparent to black', () => {
		// arrange — use transparent-friendly icon
		const input = createTestPng(72, 72, 255, 255, 255)

		// act
		const result = composeIconWithGradient(input)

		// assert — outside icon padding, alpha should increase through gradient
		const decoded = decodeResult(result)
		const alphas = []
		for (let y = 29; y < 58; y++) {
			alphas.push(getPixel(decoded, 0, y).a)
		}

		// Alpha should increase (transparent → opaque black)
		for (let i = 1; i < alphas.length; i++) {
			expect(alphas[i]).toBeGreaterThanOrEqual(alphas[i - 1])
		}
	})
})
