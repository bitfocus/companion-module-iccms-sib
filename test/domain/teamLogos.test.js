import { TeamLogos } from '../../src/domain/teamLogos.js'
import { SibConnection } from '../../src/infrastructure/connection/sibConnection.js'
import { sibHttpClientGetTeamLogo } from '../../src/infrastructure/connection/sibHttpClient.js'

vi.mock('../../src/infrastructure/connection/sibHttpClient.js', () => ({
	sibHttpClientGetTeamLogo: vi.fn(async () => ({ logoBase64: 'iVBORw0KGgoAAAANSUhEUgAAA' })),
}))

describe('Team logos version gate', () => {
	test('Skips fetching when SIB version is older than the team logo API version', async () => {
		// arrange
		const cfg = new SibConnection('', 0, '', false)
		const teamLogos = new TeamLogos()

		// act
		await teamLogos.updateTeamLogos([1], cfg, '2.14.9999')

		// assert
		expect(sibHttpClientGetTeamLogo).not.toHaveBeenCalled()
		expect(teamLogos.hasTeamLogo(1)).toBe(false)
	})

	test('Fetches team logos on the exact version that introduced the API (regression)', async () => {
		// arrange
		const cfg = new SibConnection('', 0, '', false)
		const teamLogos = new TeamLogos()

		// act
		await teamLogos.updateTeamLogos([1], cfg, '2.15.8630')

		// assert
		expect(sibHttpClientGetTeamLogo).toHaveBeenCalled()
		expect(teamLogos.hasTeamLogo(1)).toBe(true)
	})

	test('Fetches team logos on a newer version', async () => {
		// arrange
		const cfg = new SibConnection('', 0, '', false)
		const teamLogos = new TeamLogos()

		// act
		await teamLogos.updateTeamLogos([1], cfg, '2.16.0')

		// assert
		expect(sibHttpClientGetTeamLogo).toHaveBeenCalled()
		expect(teamLogos.hasTeamLogo(1)).toBe(true)
	})

	test('Fetches team logos on a non-standard 4-segment version (2.21.2.216)', async () => {
		// arrange
		const cfg = new SibConnection('', 0, '', false)
		const teamLogos = new TeamLogos()

		// act
		await teamLogos.updateTeamLogos([1], cfg, '2.21.2.216')

		// assert
		expect(sibHttpClientGetTeamLogo).toHaveBeenCalled()
		expect(teamLogos.hasTeamLogo(1)).toBe(true)
	})

	test('Fetches team logos when the version is empty / unparseable', async () => {
		// arrange
		const cfg = new SibConnection('', 0, '', false)
		const teamLogos = new TeamLogos()

		// act
		await teamLogos.updateTeamLogos([1], cfg, '')

		// assert
		expect(sibHttpClientGetTeamLogo).toHaveBeenCalled()
	})
})
