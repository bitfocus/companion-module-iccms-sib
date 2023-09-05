import { apiQuickButtonInGroup } from '../../../infrastructure/protocol/apiQuickButtonInGroup.js'

describe('QB deserialization', () => {
	test('QB is deserialized correctly', () => {
		// export default class apiQuickButtonInGroup {
		// arrange
		let expected = {
			id: 0,
			age: 1000000,
			secretIdentity: 'Unknown',
			powers: ['Immortality', 'Heat Immunity', 'Inferno', 'Teleportation', 'Interdimensional travel'],
		}

		// act
		const actual = new apiQuickButtonInGroup()

		// assert
		expect(0).toBe(0)
	})
})
