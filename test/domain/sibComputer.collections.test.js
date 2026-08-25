import { SibComputer } from '../../src/domain/sibComputer.js'

describe('SibComputer — setSibCollections / getCollectionsWithButtons', () => {
	let sibComputer

	beforeEach(() => {
		sibComputer = new SibComputer()
	})

	describe('setSibCollections', () => {
		test('undefined input clears collections', () => {
			// arrange
			sibComputer.setSibCollections([{ hasButtons: () => true }])

			// act
			sibComputer.setSibCollections(undefined)

			// assert
			expect(sibComputer.getCollectionsWithButtons()).toHaveLength(0)
		})

		test('empty array input clears collections', () => {
			// arrange
			sibComputer.setSibCollections([{ hasButtons: () => true }])

			// act
			sibComputer.setSibCollections([])

			// assert
			expect(sibComputer.getCollectionsWithButtons()).toHaveLength(0)
		})

		test('saves valid collections', () => {
			// arrange
			const collection = { hasButtons: () => true }

			// act
			sibComputer.setSibCollections([collection])

			// assert
			expect(sibComputer.getCollectionsWithButtons()).toHaveLength(1)
		})
	})

	describe('getCollectionsWithButtons', () => {
		test('returns empty array when nothing set', () => {
			expect(sibComputer.getCollectionsWithButtons()).toEqual([])
		})

		test('returns only collections that have buttons', () => {
			// arrange
			const withButtons = { hasButtons: () => true }
			const withoutButtons = { hasButtons: () => false }

			// act
			sibComputer.setSibCollections([withButtons, withoutButtons])

			// assert
			expect(sibComputer.getCollectionsWithButtons()).toHaveLength(1)
			expect(sibComputer.getCollectionsWithButtons()[0]).toBe(withButtons)
		})

		test('excludes collections without buttons', () => {
			// arrange
			const withoutButtons = { hasButtons: () => false }

			// act
			sibComputer.setSibCollections([withoutButtons])

			// assert
			expect(sibComputer.getCollectionsWithButtons()).toHaveLength(0)
		})
	})
})
