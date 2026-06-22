import { SibConnectionHttpPull } from '../../../src/infrastructure/connection/sibConnectionHttpPull.js'
import { SibConnection } from '../../../src/infrastructure/connection/sibConnection.js'
import { sibConnectionEvents } from '../../../src/infrastructure/connection/sibConnectionEvents.js'
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

describe('SibConnectionHttpPull — selective component fetching', () => {
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

	it('retries teams on the next tick after a non-429 fetch error, instead of advancing past the change', async () => {
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
			.mockRejectedValueOnce(new Error('boom')) // tick 2: generic (non-429) failure on the bumped teams
			.mockResolvedValue([]) // tick 3: must retry the still-stale teams

		connection = new SibConnectionHttpPull()

		// act — tick 1 runs inside connectToSib; ticks 2 and 3 fire from the reschedule timer.
		await connection.connectToSib(config) // tick 1: fetch all (no baseline yet)
		await vi.advanceTimersByTimeAsync(config.pullIntervall) // tick 2: teams errors (non-429)
		await vi.advanceTimersByTimeAsync(config.pullIntervall) // tick 3: teams must be retried

		// assert — teams fetched on tick 1, attempted+errored on tick 2, and RETRIED on tick 3.
		expect(mocks.sibHttpClientGetTeams).toHaveBeenCalledTimes(3)
	})

	it('does not re-arm the poll loop when disconnect happens while a tick is in flight', async () => {
		// arrange — tick 1 succeeds; tick 2 hangs on the info call so we can disconnect mid-flight.
		const info = sibInfoWithComponentsFixture.create()

		let resolveTick2
		const tick2InfoPromise = new Promise((resolve) => {
			resolveTick2 = resolve
		})

		mocks.sibHttpClientGetSibInfo
			.mockResolvedValueOnce(info) // tick 1
			.mockReturnValueOnce(tick2InfoPromise) // tick 2: parked until we resolve it
			.mockResolvedValue(info) // tick 3+: must never be reached
		mocks.sibHttpClientGetTeams.mockResolvedValue([])
		mocks.sibHttpClientGetQuickButtonCollectionsAsync.mockResolvedValue([])
		mocks.sibHttpClientGetRundownsWithoutItems.mockResolvedValue([])

		connection = new SibConnectionHttpPull()

		// act — tick 1 completes inside connectToSib, tick 2 fires and parks on the info call.
		await connection.connectToSib(config)
		await vi.advanceTimersByTimeAsync(config.pullIntervall)
		expect(mocks.sibHttpClientGetSibInfo).toHaveBeenCalledTimes(2)

		// Disconnect while tick 2 is still awaiting, then let tick 2 finish.
		connection.disconnectFromSib()
		resolveTick2(info)
		await vi.advanceTimersByTimeAsync(config.pullIntervall * 3)

		// assert — the finishing tick did not reschedule, so no tick 3 ever ran.
		expect(mocks.sibHttpClientGetSibInfo).toHaveBeenCalledTimes(2)
	})

	it('good path: a fully successful poll fetches every component once and emits each update event with no error', async () => {
		// arrange
		const info = sibInfoWithComponentsFixture.create()
		const apiTeams = [{ Id: 1, Name: 'Team A' }]
		const apiCollections = [{ Id: 10, Name: 'Collection A' }]
		const apiRundowns = [{ Id: 7, Name: 'Rundown A' }]

		mocks.sibHttpClientGetSibInfo.mockResolvedValue(info)
		mocks.sibHttpClientGetTeams.mockResolvedValue(apiTeams)
		mocks.sibHttpClientGetQuickButtonCollectionsAsync.mockResolvedValue(apiCollections)
		mocks.sibHttpClientGetRundownsWithoutItems.mockResolvedValue(apiRundowns)

		const events = { db: [], teams: [], quickButtons: [], rundowns: [], connected: 0, errors: [] }
		connection = new SibConnectionHttpPull()
		connection.on(sibConnectionEvents.OnSibDatabaseChanges, (v) => events.db.push(v))
		connection.on(sibConnectionEvents.OnSibTeamsUpdated, (v) => events.teams.push(v))
		connection.on(sibConnectionEvents.OnSibQuickButtonsUpdated, (v) => events.quickButtons.push(v))
		connection.on(sibConnectionEvents.OnSibRundownUpdated, (v) => events.rundowns.push(v))
		connection.on(sibConnectionEvents.OnSibConnected, () => (events.connected += 1))
		connection.on(sibConnectionEvents.OnSibError, (m) => events.errors.push(m))

		// act — one fully successful tick.
		await connection.connectToSib(config)

		// assert — every component fetched exactly once.
		expect(mocks.sibHttpClientGetTeams).toHaveBeenCalledTimes(1)
		expect(mocks.sibHttpClientGetQuickButtonCollectionsAsync).toHaveBeenCalledTimes(1)
		expect(mocks.sibHttpClientGetRundownsWithoutItems).toHaveBeenCalledTimes(1)

		// ...each update event fired once with the fetched data, connection reported, no error.
		expect(events.db).toEqual([info])
		expect(events.teams).toEqual([apiTeams])
		expect(events.quickButtons).toEqual([apiCollections])
		expect(events.rundowns).toEqual([apiRundowns])
		expect(events.connected).toBe(1)
		expect(events.errors).toEqual([])
	})
})
