import { SibComputer } from '../../src/domain/sibComputer.js'

describe('SibComputer — setSibTeams / getSibTeams', () => {
	let sibComputer

	beforeEach(() => {
		sibComputer = new SibComputer()
	})

	describe('setSibTeams', () => {
		describe('bad input does not corrupt sibCollections (fix M10)', () => {
			test('undefined input does not corrupt sibCollections', () => {
				// arrange
				sibComputer.setSibCollections([{ hasButtons: () => true }])

				// act
				sibComputer.setSibTeams(undefined)

				// assert
				expect(sibComputer.getCollectionsWithButtons()).toHaveLength(1)
			})

			test('non-array input does not corrupt sibCollections', () => {
				// arrange
				sibComputer.setSibCollections([{ hasButtons: () => true }])

				// act
				sibComputer.setSibTeams('not-an-array')

				// assert
				expect(sibComputer.getCollectionsWithButtons()).toHaveLength(1)
			})

			test('undefined input clears sibTeams', () => {
				// arrange
				sibComputer.setSibTeams([{ Id: 1, Name: 'Team A' }])

				// act
				sibComputer.setSibTeams(undefined)

				// assert
				expect(sibComputer.getSibTeams()).toHaveLength(0)
			})

			test('empty array clears sibTeams', () => {
				// arrange
				sibComputer.setSibTeams([{ Id: 1, Name: 'Team A' }])

				// act
				sibComputer.setSibTeams([])

				// assert
				expect(sibComputer.getSibTeams()).toHaveLength(0)
			})
		})

		test('saves valid teams array', () => {
			// arrange
			const teams = [
				{ Id: 1, Name: 'Team A' },
				{ Id: 2, Name: 'Team B' },
			]

			// act
			sibComputer.setSibTeams(teams)

			// assert
			expect(sibComputer.getSibTeams()).toHaveLength(2)
		})
	})

	describe('getSibTeams', () => {
		test('returns empty array when nothing set', () => {
			expect(sibComputer.getSibTeams()).toEqual([])
		})

		test('returns teams matching saved values', () => {
			// arrange
			const team = { Id: 42, Name: 'Team X' }

			// act
			sibComputer.setSibTeams([team])
			const result = sibComputer.getSibTeams()

			// assert
			expect(result[0].Id).toBe(42)
			expect(result[0].Name).toBe('Team X')
		})

		test('returns a copy — modifying the result does not affect stored teams', () => {
			// arrange
			sibComputer.setSibTeams([{ Id: 1, Name: 'Team A' }])

			// act
			const result = sibComputer.getSibTeams()
			result.push({ Id: 99, Name: 'Injected' })

			// assert
			expect(sibComputer.getSibTeams()).toHaveLength(1)
		})
	})
})
