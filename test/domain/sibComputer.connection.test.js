import { SibComputer } from '../../src/domain/sibComputer.js'
import { SibConnection } from '../../src/infrastructure/connection/sibConnection.js'

describe('SibComputer — setConnectionConfig / getConnectionConfig / getApiUrl', () => {
	let sibComputer

	beforeEach(() => {
		sibComputer = new SibComputer()
	})

	describe('getApiUrl', () => {
		test('returns empty string when config not yet set', () => {
			expect(sibComputer.getApiUrl()).toBe('')
		})

		test('returns configured sibIpPort', () => {
			// arrange
			const cfg = new SibConnection('192.168.1.100', 8080, '', false, false, false, '', false)
			sibComputer.setConnectionConfig(cfg)

			// act & assert
			expect(sibComputer.getApiUrl()).toBe('192.168.1.100:8080')
		})
	})

	describe('setConnectionConfig / getConnectionConfig', () => {
		test('saves and retrieves connection config', () => {
			// arrange
			const cfg = new SibConnection('127.0.0.1', 8080, 'token123', false, false, false, '', false)

			// act
			sibComputer.setConnectionConfig(cfg)

			// assert
			expect(sibComputer.getConnectionConfig()).toBe(cfg)
		})

		test('undefined input does not overwrite existing config', () => {
			// arrange
			const cfg = new SibConnection('127.0.0.1', 8080, '', false, false, false, '', false)
			sibComputer.setConnectionConfig(cfg)

			// act
			sibComputer.setConnectionConfig(undefined)

			// assert
			expect(sibComputer.getConnectionConfig()).toBe(cfg)
		})
	})
})
