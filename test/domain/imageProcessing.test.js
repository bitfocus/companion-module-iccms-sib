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

	test('handles non-square input by scaling to fill width', () => {
		// arrange — 36x36 scales to 72x72 (fill width)
		const input = createTestPng(36, 36, 100, 100, 100)

		// act
		const result = composeIconWithGradient(input)

		// assert
		const decoded = decodeResult(result)
		expect(decoded.width).toBe(72)
		expect(decoded.height).toBe(58)

		// Icon pixel within padded area should have color
		const px = getPixel(decoded, 36, 10)
		expect(px.r).toBe(100)
	})

	describe('without bgColor', () => {
		test.each([
			['undefined', undefined],
			['null', null],
			['empty string', ''],
			['#838383', '#838383'],
			['#838383FF (with alpha)', '#838383FF'],
		])('treats %s as no color — bottom row is near-transparent', (_label, bgColor) => {
			// arrange
			const input = createTestPng(72, 72, 255, 255, 255)

			// act
			const result = composeIconWithGradient(input, bgColor)

			// assert — last row near end of gradient
			const px = getPixel(decodeResult(result), 36, 57)
			expect(px.a).toBeLessThanOrEqual(10)
		})

		test('bottom row is near-transparent', () => {
			// arrange
			const input = createTestPng(72, 72, 255, 255, 255)

			// act
			const result = composeIconWithGradient(input)

			// assert — last row should be near end of gradient
			const px = getPixel(decodeResult(result), 36, 57)
			expect(px.a).toBeLessThanOrEqual(10)
		})

		test('icon pixels are visible in top area', () => {
			// arrange — 72x72 scales to fill 72px width
			const input = createTestPng(72, 72, 0, 200, 0)

			// act
			const result = composeIconWithGradient(input)

			// assert — pixel (36, 5) is center of icon, above gradient
			const px = getPixel(decodeResult(result), 36, 5)
			expect(px.g).toBe(200)
			expect(px.a).toBe(255)
		})

		test('gradient fades icon all the way to bottom', () => {
			// arrange
			const input = createTestPng(72, 72, 255, 255, 255)

			// act
			const result = composeIconWithGradient(input)

			// assert — gradient runs from row 29 to 57
			const decoded = decodeResult(result)
			const alphas = []
			for (let y = 29; y < 58; y++) {
				alphas.push(getPixel(decoded, 36, y).a)
			}

			// Alpha should decrease through gradient
			for (let i = 1; i < alphas.length; i++) {
				expect(alphas[i]).toBeLessThanOrEqual(alphas[i - 1])
			}
		})
	})

	describe('with bgColor', () => {
		test('bottom row is near-black and opaque', () => {
			// arrange
			const input = createTestPng(72, 72, 255, 255, 255)

			// act
			const result = composeIconWithGradient(input, '#FF0000')

			// assert — last row should be near end of gradient
			const px = getPixel(decodeResult(result), 36, 57)
			expect(px.r).toBeLessThanOrEqual(20)
			expect(px.g).toBeLessThanOrEqual(20)
			expect(px.b).toBeLessThanOrEqual(20)
			expect(px.a).toBe(255)
		})

		test('gradient fades bgColor to black all the way down', () => {
			// arrange — use black icon so bg color is visible through compositing
			const input = createTestPng(72, 72, 0, 0, 0)

			// act
			const result = composeIconWithGradient(input, '#FF0000')

			// assert — bg color gradient visible in composited result
			const decoded = decodeResult(result)
			// Above gradient: bg is red, but icon (black) is composited on top
			// Check that bottom row is near-black (gradient endpoint)
			const px = getPixel(decoded, 0, 57)
			expect(px.r).toBeLessThanOrEqual(10)
		})

		test('canvas is opaque when bgColor is set', () => {
			// arrange
			const input = createTestPng(72, 72, 0, 0, 255)

			// act
			const result = composeIconWithGradient(input, '#FF0000')

			// assert — all pixels should be fully opaque
			const decoded = decodeResult(result)
			const topPx = getPixel(decoded, 0, 5)
			const bottomPx = getPixel(decoded, 0, 57)
			expect(topPx.a).toBe(255)
			expect(bottomPx.a).toBe(255)
		})
	})
})
