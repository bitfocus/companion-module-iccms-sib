import { sibHttpClientGetSibInfo } from '../../../src/infrastructure/connection/sibHttpClient.js'
import * as http from 'http'
import { sibInfoWithComponentsFixture } from '../../fixtures/sibInfoWithComponentsFixture.js'

vi.mock('http')

describe('sibHttpClientGetSibInfo', () => {
	const mockBaseUrl = 'localhost:8080'
	const mockDeviceId = 'device_123'
	let expected
	let mockSibInfoResponse

	beforeEach(() => {
		vi.clearAllMocks()
		expected = sibInfoWithComponentsFixture.create()
		mockSibInfoResponse = JSON.stringify(expected)
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should return ApiMessageSibInfo object on success', async () => {
		const mockEmitter = {
			on: vi.fn(function (event, callback) {
				if (event === 'end') {
					callback()
				}
				return this
			}),
		}

		http.get.mockImplementation((_, callback) => {
			callback({
				statusCode: 200,
				on: vi.fn(function (event, listener) {
					if (event === 'data') {
						listener(Buffer.from(mockSibInfoResponse))
					} else if (event === 'end') {
						listener()
					}
					return this
				}),
			})
			return mockEmitter
		})

		const result = await sibHttpClientGetSibInfo(mockBaseUrl, mockDeviceId)
		expect(result).toBeDefined()
		expect(result.SportInTheBoxVersion).toBe(expected.SportInTheBoxVersion)
		expect(result.ResponseDate).toBe(expected.ResponseDate)
		expect(result.DatabasePath).toBe(expected.DatabasePath)
		expect(result.LogOnName).toBe(expected.LogOnName)
		expect(result.ComponentLastModified).toEqual(expected.ComponentLastModified)
	})

	it('should reject on HTTP error status code', async () => {
		const mockEmitter = {
			on: vi.fn(function () {
				return this
			}),
		}

		http.get.mockImplementation((_, callback) => {
			callback({
				statusCode: 500,
				on: vi.fn(function () {
					return this
				}),
			})
			return mockEmitter
		})

		await expect(sibHttpClientGetSibInfo(mockBaseUrl, mockDeviceId)).rejects.toThrow('HTTP Error 500')
	})

	it('should reject on request error', async () => {
		const mockEmitter = {
			on: vi.fn(function (event, callback) {
				if (event === 'error') {
					callback(new Error('Network error'))
				}
				return this
			}),
		}

		http.get.mockImplementation(() => {
			return mockEmitter
		})

		await expect(sibHttpClientGetSibInfo(mockBaseUrl, mockDeviceId)).rejects.toThrow('Network error')
	})

	it('should reject when the request times out instead of hanging (silent SIB)', async () => {
		// arrange — server accepts the socket but never responds. http.get returns a request
		// that gets a socket; tripping the socket 'timeout' must reject and destroy the
		// request rather than leave the promise (and the poll loop) hanging forever.
		let socketTimeoutCb
		const fakeSocket = {
			setTimeout: vi.fn(),
			on: vi.fn(function (event, cb) {
				if (event === 'timeout') socketTimeoutCb = cb
				return this
			}),
		}
		const mockEmitter = {
			on: vi.fn(function (event, cb) {
				if (event === 'socket') cb(fakeSocket)
				return this
			}),
			destroy: vi.fn(),
		}
		http.get.mockImplementation(() => mockEmitter)

		// act — start the request, then trip the socket timeout
		const promise = sibHttpClientGetSibInfo(mockBaseUrl, mockDeviceId)
		socketTimeoutCb()

		// assert
		await expect(promise).rejects.toThrow(/timed out/i)
		expect(fakeSocket.setTimeout).toHaveBeenCalledWith(expect.any(Number))
		expect(mockEmitter.destroy).toHaveBeenCalled()
	})
})
