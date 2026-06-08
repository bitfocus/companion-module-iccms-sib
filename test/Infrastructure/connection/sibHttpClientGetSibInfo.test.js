import {sibHttpClientGetSibInfo} from '../../../infrastructure/connection/sibHttpClient.js'
import * as http from 'http'
import {jest} from '@jest/globals'
import {sibInfoWithComponentsFixture} from '../../fixtures/sibInfoWithComponentsFixture.js'

jest.mock('http')

describe('sibHttpClientGetSibInfo', () => {
  const mockBaseUrl = 'localhost:8080'
  const mockDeviceId = 'device_123'
  let expected
  let mockSibInfoResponse

  beforeEach(() => {
    jest.clearAllMocks()
    expected = sibInfoWithComponentsFixture.create()
    mockSibInfoResponse = JSON.stringify(expected)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return ApiMessageSibInfo object on success', async () => {
    const mockEmitter = {
      on: jest.fn(function (event, callback) {
        if (event === 'end') {
          callback()
        }
        return this
      }),
    }

    http.get.mockImplementation((_, callback) => {
      callback({
        statusCode: 200,
        on: jest.fn(function (event, listener) {
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
      on: jest.fn(function () {
        return this
      }),
    }

    http.get.mockImplementation((_, callback) => {
      callback({
        statusCode: 500,
        on: jest.fn(function () {
          return this
        }),
      })
      return mockEmitter
    })

    await expect(
      sibHttpClientGetSibInfo(mockBaseUrl, mockDeviceId)
    ).rejects.toThrow('HTTP Error 500')
  })

  it('should reject on request error', async () => {
    const mockEmitter = {
      on: jest.fn(function (event, callback) {
        if (event === 'error') {
          callback(new Error('Network error'))
        }
        return this
      }),
    }

    http.get.mockImplementation(() => {
      return mockEmitter
    })

    await expect(
      sibHttpClientGetSibInfo(mockBaseUrl, mockDeviceId)
    ).rejects.toThrow('Network error')
  })
})
