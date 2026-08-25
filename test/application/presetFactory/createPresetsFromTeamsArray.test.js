import { vi } from 'vitest'
import { composeIconWithGradient } from '../../../src/domain/imageProcessing.js'
import { createPresetsFromTeamsArray } from '../../../src/application/presetFactory/createPresetsFromTeamsArray.js'

vi.mock('../../../src/domain/imageProcessing.js', () => ({
	composeIconWithGradient: vi.fn(),
}))

describe('createPresetsFromTeamsArray', () => {
	beforeEach(() => {
		composeIconWithGradient.mockReturnValue('composed-logo')
	})
	test('creates correct presets for teams array', () => {
		// arrange
		const team1 = {
			Id: 4,
			Name: 'Team Arlen',
			ShortName: 'T-Arl',
			TeamColorHex: '#F2EA35FF',
		}
		const team2 = {
			Id: 5,
			Name: 'Team Five',
			ShortName: 'T-Five',
			TeamColorHex: '#F2EA35FF',
		}
		const teams = [team1, team2]

		// act
		const actual = createPresetsFromTeamsArray(teams)

		// assert
		// Should have 2 headers and 2x2 buttons = 4 presets per 2 teams
		const expectedKeys = [
			'header_team_4',
			'team_4_home',
			'team_4_guest',
			'header_team_5',
			'team_5_home',
			'team_5_guest',
		]
		// The function creates 3 presets per team (header, home, guest)
		expect(Object.keys(actual).sort()).toEqual(expectedKeys.sort())

		// Check header structure
		expect(actual['header_team_4']).toMatchObject({
			type: 'text',
			category: 'Teams',
			name: 'Team Arlen',
			text: expect.any(String),
		})
		expect(actual['header_team_5']).toMatchObject({
			type: 'text',
			category: 'Teams',
			name: 'Team Five',
			text: expect.any(String),
		})

		// Check home button structure
		expect(actual['team_4_home']).toMatchObject({
			type: 'button',
			category: 'Teams',
			name: expect.stringContaining('home team'),
			style: expect.any(Object),
			steps: expect.any(Array),
			feedbacks: expect.any(Array),
		})
		expect(actual['team_5_home']).toMatchObject({
			type: 'button',
			category: 'Teams',
			name: expect.stringContaining('home team'),
			style: expect.any(Object),
			steps: expect.any(Array),
			feedbacks: expect.any(Array),
		})

		// Check guest button structure
		expect(actual['team_4_guest']).toMatchObject({
			type: 'button',
			category: 'Teams',
			name: expect.stringContaining('guest team'),
			style: expect.any(Object),
			steps: expect.any(Array),
			feedbacks: expect.any(Array),
		})
		expect(actual['team_5_guest']).toMatchObject({
			type: 'button',
			category: 'Teams',
			name: expect.stringContaining('guest team'),
			style: expect.any(Object),
			steps: expect.any(Array),
			feedbacks: expect.any(Array),
		})
	})

	test('returns empty object for empty array', () => {
		// arrange
		const teams = []

		// act
		const actual = createPresetsFromTeamsArray(teams)

		// assert
		expect(actual).toEqual({})
	})

	test('returns empty object for undefined', () => {
		// act
		const actual = createPresetsFromTeamsArray(undefined)

		// assert
		expect(actual).toEqual({})
	})

	test('looks up logo from teamLogos cache and sets png64 on team buttons', () => {
		// arrange
		const team = {
			Id: 7,
			Name: 'Team Seven',
			ShortName: 'T-Sev',
			TeamColorHex: '#112233',
		}
		const teamLogos = {
			getTeamLogoPngBase64: vi.fn((id) => (id === 7 ? 'png-bytes-7' : '')),
		}

		// act
		const actual = createPresetsFromTeamsArray([team], teamLogos)

		// assert
		expect(teamLogos.getTeamLogoPngBase64).toHaveBeenCalledWith(7)
		expect(actual['team_7_home'].style.png64).toBeDefined()
		expect(actual['team_7_guest'].style.png64).toBeDefined()
	})

	test('falls back to color when teamLogos returns empty string', () => {
		// arrange
		const team = {
			Id: 8,
			Name: 'Team Eight',
			ShortName: 'T-Eig',
			TeamColorHex: '#445566',
		}
		const teamLogos = {
			getTeamLogoPngBase64: vi.fn(() => ''),
		}

		// act
		const actual = createPresetsFromTeamsArray([team], teamLogos)

		// assert
		expect(actual['team_8_home'].style.png64).toBeUndefined()
		expect(actual['team_8_guest'].style.png64).toBeUndefined()
	})

	test('does not set png64 when composeIconWithGradient returns empty string (compose error)', () => {
		// arrange
		composeIconWithGradient.mockReturnValue('')
		const team = {
			Id: 10,
			Name: 'Team Ten',
			ShortName: 'T-Ten',
			TeamColorHex: '#123456',
		}
		const teamLogos = {
			getTeamLogoPngBase64: vi.fn(() => 'raw-logo-data'),
		}

		// act
		const actual = createPresetsFromTeamsArray([team], teamLogos)

		// assert
		expect(actual['team_10_home'].style.png64).toBeUndefined()
		expect(actual['team_10_guest'].style.png64).toBeUndefined()
	})

	test('composes logo once per team for both home and guest buttons', () => {
		// arrange
		const team = { Id: 9, Name: 'Team Nine', ShortName: 'T-Nine', TeamColorHex: '#001122' }
		const teamLogos = {
			getTeamLogoPngBase64: vi.fn((id) => (id === 9 ? 'raw-logo-data' : '')),
		}

		// act
		const actual = createPresetsFromTeamsArray([team], teamLogos)

		// assert - composed value on both buttons
		expect(actual['team_9_home'].style.png64).toBe('composed-logo')
		expect(actual['team_9_guest'].style.png64).toBe('composed-logo')

		// composed once per team, not once per button
		expect(composeIconWithGradient).toHaveBeenCalledTimes(1)
		expect(composeIconWithGradient).toHaveBeenCalledWith('raw-logo-data')
	})
})
