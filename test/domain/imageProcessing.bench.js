/*
 * Benchmarks for composeIconWithGradient (src/domain/imageProcessing.js).
 * Covers M4: synchronous PNG composite cost on Companion's main thread.
 * Last run: 2026-06-18, Node v22.23.0, Windows 10, Vitest 4.1.9
 *
 * single call - small icon (16x16): 0.54 ms
 * single call - typical icon (72x72): 0.68 ms
 * single call - large icon (200x200): 1.45 ms
 * intra-build redundancy - 4x same icon (1 rundown x 4 action types): 2.52 ms
 * intra-build redundancy - 2x same logo (1 team, home + guest): 1.17 ms
 * full preset build - 75 quick buttons (TEST_ManyIcons fixture): 38.6 ms
 * full preset build - 20 teams x 2 buttons (pre-fix baseline, 40 composites): 22.2 ms
 * full preset build - 5 rundowns x 4 action types (pre-fix baseline, 20 composites): 9.83 ms
 * full sync simulation - 75 buttons + 20 teams + 5 rundowns (pre-fix baseline): ~72 ms per data-change event
 */
import { bench, describe } from 'vitest'
import { PNG } from 'pngjs'
import { composeIconWithGradient } from '../../src/domain/imageProcessing.js'

function makePng(width, height) {
	const png = new PNG({ width, height })
	for (let i = 0; i < width * height * 4; i += 4) {
		png.data[i] = 200
		png.data[i + 1] = 100
		png.data[i + 2] = 50
		png.data[i + 3] = 255
	}
	return PNG.sync.write(png).toString('base64')
}

// Pre-built icons - excluded from benchmark timing
const typicalIcon = makePng(72, 72)
const smallIcon = makePng(16, 16)
const largeIcon = makePng(200, 200)

// 75 distinct icons matching the TEST_ManyIcons fixture button count
const seventyFiveIcons = Array.from({ length: 75 }, (_, i) => makePng(16 + (i % 56), 16 + (i % 56)))

// 20 team logos (home + guest = 2 calls per team)
const twentyTeamLogos = Array.from({ length: 20 }, (_, i) => makePng(48 + (i % 24), 48 + (i % 24)))

// 5 rundown icons (4 action-type presets per rundown = 4 identical calls per icon)
const fiveRundownIcons = Array.from({ length: 5 }, (_, i) => makePng(32 + (i % 16), 32 + (i % 16)))

describe('composeIconWithGradient performance', () => {
	bench('single call - small icon (16x16)', () => {
		composeIconWithGradient(smallIcon)
	})

	bench('single call - typical icon (72x72)', () => {
		composeIconWithGradient(typicalIcon)
	})

	bench('single call - large icon (200x200)', () => {
		composeIconWithGradient(largeIcon)
	})

	bench('rundown intra-build redundancy - 4x same icon (1 rundown, 4 action types)', () => {
		composeIconWithGradient(typicalIcon)
		composeIconWithGradient(typicalIcon)
		composeIconWithGradient(typicalIcon)
		composeIconWithGradient(typicalIcon)
	})

	bench('team intra-build redundancy - 2x same logo (1 team, home + guest)', () => {
		composeIconWithGradient(typicalIcon)
		composeIconWithGradient(typicalIcon)
	})

	bench('full preset build - 75 quick buttons (fixture scale)', () => {
		for (const icon of seventyFiveIcons) {
			composeIconWithGradient(icon)
		}
	})

	bench('full preset build - 20 teams x 2 buttons (home + guest)', () => {
		for (const logo of twentyTeamLogos) {
			composeIconWithGradient(logo)
			composeIconWithGradient(logo)
		}
	})

	bench('full preset build - 5 rundowns x 4 action types (redundant calls)', () => {
		for (const icon of fiveRundownIcons) {
			composeIconWithGradient(icon)
			composeIconWithGradient(icon)
			composeIconWithGradient(icon)
			composeIconWithGradient(icon)
		}
	})

	bench('full sync simulation - 75 buttons + 20 teams + 5 rundowns', () => {
		for (const icon of seventyFiveIcons) {
			composeIconWithGradient(icon)
		}
		for (const logo of twentyTeamLogos) {
			composeIconWithGradient(logo)
			composeIconWithGradient(logo)
		}
		for (const icon of fiveRundownIcons) {
			composeIconWithGradient(icon)
			composeIconWithGradient(icon)
			composeIconWithGradient(icon)
			composeIconWithGradient(icon)
		}
	})
})
