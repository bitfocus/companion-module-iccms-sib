import { PNG } from 'pngjs'

/**
 * Creates a solid-color test PNG as base64 string.
 * @param {number} [width=72]
 * @param {number} [height=72]
 * @param {number} [r=128]
 * @param {number} [g=128]
 * @param {number} [b=128]
 * @returns {string} base64-encoded PNG
 */
export function createTestPngBase64(width = 72, height = 72, r = 128, g = 128, b = 128) {
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
