import { SibConnectionHttpPull } from '../../../src/infrastructure/connection/sibConnectionHttpPull.js'
import { SibConnection } from '../../../src/infrastructure/connection/sibConnection.js'
import { sibInfoWithComponentsFixture } from '../../fixtures/sibInfoWithComponentsFixture.js'

// Hoisted so the mock factory returns the exact vi.fn() instances driven below.
// SibRateLimitError is re-declared here so the SUT and this test share one class
// reference — the SUT routes rate limits on `instanceof`.
const mocks = vi.hoisted(() => ({
	SibRateLimitError: class SibRateLimitError extends Error {},
	sibHttpClientGetSibInfo: vi.fn(),
	sibHttpClientGetTeams: vi.fn(),
	sibHttpClientGetQuickButtonCollectionsAsync: vi.fn(),
	sibHttpClientGetRundownsWithoutItems: vi.fn(),
}))

vi.mock('../../../src/infrastructure/connection/sibHttpClient.js', () => mocks)

// Silence the chatty debug logging during the test run.
vi.mock('../../../src/logger.js', () => ({
	logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

describe('SibConnectionHttpPull — selective re-fetch after a rate-limited component fetch', () => {
	/** @type {SibConnection} */
	let config
	/** @type {SibConnectionHttpPull} */
	let connection

	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()
		config = new SibConnection('127.0.0.1', 8080, 'api-pwd', true, false, false, 'helper-pwd', false)
	})

	afterEach(() => {
		connection?.disconnectFromSib()
		vi.useRealTimers()
		vi.resetAllMocks()
	})

	it('retries teams on the next tick after a 429, instead of skipping until SIB bumps the timestamp again', async () => {
		// arrange
		const infoTeamV1 = sibInfoWithComponentsFixture.create()
		infoTeamV1.ComponentLastModified = { QuickButton: 'qb-1', Rundown: 'rd-1', Team: 'team-1' }

		// SIB bumps the Team timestamp once; QuickButton/Rundown stay unchanged.
		const infoTeamV2 = sibInfoWithComponentsFixture.create()
		infoTeamV2.ComponentLastModified = { QuickButton: 'qb-1', Rundown: 'rd-1', Team: 'team-2' }

		mocks.sibHttpClientGetSibInfo
			.mockResolvedValueOnce(infoTeamV1) // tick 1
			.mockResolvedValue(infoTeamV2) // ticks 2 and 3: the bumped timestamp stays put

		mocks.sibHttpClientGetQuickButtonCollectionsAsync.mockResolvedValue([])
		mocks.sibHttpClientGetRundownsWithoutItems.mockResolvedValue([])

		mocks.sibHttpClientGetTeams
			.mockResolvedValueOnce([]) // tick 1: success -> baseline becomes team-1
			.mockRejectedValueOnce(new mocks.SibRateLimitError()) // tick 2: 429 while fetching the bumped teams
			.mockResolvedValue([]) // tick 3: must retry the still-stale teams

		connection = new SibConnectionHttpPull()

		// act — tick 1 runs inside connectToSib; ticks 2 and 3 fire from the reschedule timer.
		await connection.connectToSib(config) // tick 1: fetch all (no baseline yet)
		await vi.advanceTimersByTimeAsync(config.pullIntervall) // tick 2: teams 429
		await vi.advanceTimersByTimeAsync(config.pullIntervall) // tick 3: teams must be retried

		// assert — teams fetched on tick 1, attempted+429 on tick 2, and RETRIED on tick 3.
		expect(mocks.sibHttpClientGetTeams).toHaveBeenCalledTimes(3)
	})
})
