import { composeIconWithGradient } from '../../../src/domain/imageProcessing.js'
import { createPresetsFromRundownsArray } from '../../../src/application/presetFactory/createPresetsFromRundownsArray.js'

vi.mock('../../../src/domain/imageProcessing.js', () => ({
	composeIconWithGradient: vi.fn(),
}))

const ACTION_IDS = ['select_rundown', 'current_run_line', 'current_select_prev', 'current_select_next']

function makeSibIcons(iconId, rawPng) {
	return {
		hasIcon: vi.fn((id) => id === iconId),
		getIconPngBase64: vi.fn((id) => (id === iconId ? rawPng : '')),
	}
}

describe('createPresetsFromRundownsArray', () => {
	test('returns empty object for null', () => {
		// act
		const actual = createPresetsFromRundownsArray(null)

		// assert
		expect(actual).toEqual({})
	})

	test('returns empty object for undefined', () => {
		// act
		const actual = createPresetsFromRundownsArray(undefined)

		// assert
		expect(actual).toEqual({})
	})

	test('returns empty object for empty Rundowns array', () => {
		// act
		const actual = createPresetsFromRundownsArray({ Rundowns: [] })

		// assert
		expect(actual).toEqual({})
	})

	test('creates header and 4 action button presets per rundown', () => {
		// arrange
		const allRundowns = {
			Rundowns: [
				{ Id: 1, RundownName: 'Match', ColorHex: '#FF0000', IconId: null },
				{ Id: 2, RundownName: 'Halftime', ColorHex: '#00FF00', IconId: null },
			],
		}

		// act
		const actual = createPresetsFromRundownsArray(allRundowns)

		// assert
		const expectedKeys = [
			'header_rundown_1',
			...ACTION_IDS.map((a) => `rundown_1_${a}`),
			'header_rundown_2',
			...ACTION_IDS.map((a) => `rundown_2_${a}`),
		]
		expect(Object.keys(actual).sort()).toEqual(expectedKeys.sort())

		expect(actual['header_rundown_1']).toMatchObject({
			type: 'text',
			category: 'Rundowns',
			name: 'Match',
		})

		expect(actual['rundown_1_select_rundown']).toMatchObject({
			type: 'button',
			category: 'Rundowns',
			steps: expect.any(Array),
			feedbacks: expect.any(Array),
		})
	})

	test('applies composed icon to all 4 action presets and composes only once per rundown', () => {
		// arrange
		const sibIcons = makeSibIcons('icon-abc', 'raw-png-data')
		composeIconWithGradient.mockReturnValue('composed-png')

		const allRundowns = {
			Rundowns: [{ Id: 5, RundownName: 'Final', ColorHex: '#000000', IconId: 'icon-abc' }],
		}

		// act
		const actual = createPresetsFromRundownsArray(allRundowns, sibIcons)

		// assert - icon on all 4 button presets and their preview styles
		for (const actionId of ACTION_IDS) {
			const preset = actual[`rundown_5_${actionId}`]
			expect(preset.style.png64).toBe('composed-png')
			expect(preset.previewStyle.png64).toBe('composed-png')
		}

		// composed once per rundown, not once per action type
		expect(composeIconWithGradient).toHaveBeenCalledTimes(1)
		expect(composeIconWithGradient).toHaveBeenCalledWith('raw-png-data')
	})

	test('omits png64 when composeIconWithGradient returns empty string (compose error)', () => {
		// arrange
		const sibIcons = makeSibIcons('icon-abc', 'raw-png-data')
		composeIconWithGradient.mockReturnValue('')
		const allRundowns = {
			Rundowns: [{ Id: 9, RundownName: 'Overtime', ColorHex: '#000000', IconId: 'icon-abc' }],
		}

		// act
		const actual = createPresetsFromRundownsArray(allRundowns, sibIcons)

		// assert
		for (const actionId of ACTION_IDS) {
			const preset = actual[`rundown_9_${actionId}`]
			expect(preset.style.png64).toBeUndefined()
			expect(preset.previewStyle.png64).toBeUndefined()
		}
	})

	test('omits png64 when icon is not in sibIcons cache', () => {
		// arrange
		const sibIcons = makeSibIcons('other-icon', 'raw-png-data')
		const allRundowns = {
			Rundowns: [{ Id: 6, RundownName: 'Warmup', ColorHex: '#000000', IconId: 'icon-abc' }],
		}

		// act
		const actual = createPresetsFromRundownsArray(allRundowns, sibIcons)

		// assert
		for (const actionId of ACTION_IDS) {
			expect(actual[`rundown_6_${actionId}`].style.png64).toBeUndefined()
		}
		expect(composeIconWithGradient).not.toHaveBeenCalled()
	})

	test('omits png64 when sibIcons is not provided', () => {
		// arrange
		const allRundowns = {
			Rundowns: [{ Id: 7, RundownName: 'Shootout', ColorHex: '#000000', IconId: 'icon-xyz' }],
		}

		// act
		const actual = createPresetsFromRundownsArray(allRundowns, undefined)

		// assert
		for (const actionId of ACTION_IDS) {
			expect(actual[`rundown_7_${actionId}`].style.png64).toBeUndefined()
		}
	})

	test('truncates rundown name longer than 16 characters', () => {
		// arrange
		const allRundowns = {
			Rundowns: [{ Id: 8, RundownName: 'A Very Long Rundown Name', ColorHex: '#000000', IconId: null }],
		}

		// act
		const actual = createPresetsFromRundownsArray(allRundowns)

		// assert - name in style text is truncated to 15 chars + ellipsis
		const style = actual['rundown_8_select_rundown'].style
		expect(style.text).toContain('A Very Long Run…')
	})
})
