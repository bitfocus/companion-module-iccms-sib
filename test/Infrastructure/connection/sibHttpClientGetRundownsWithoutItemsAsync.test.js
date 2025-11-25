import { sibHttpClientGetRundownsWithoutItems } from '../../../infrastructure/connection/sibHttpClient.js';
import * as http from 'http';
import { jest } from '@jest/globals';

jest.mock('http');

describe('sibHttpClientGetRundownsWithoutItems', () => {
  const mockBaseUrl = 'localhost:8080';
  const mockToken = 'test_token';
  const mockDeviceId = 'device_123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should construct the correct URL with token', async () => {
    const mockResponse = JSON.stringify([{ id: 1, name: 'Rundown 1' }]);
    const mockEmitter = {
      on: jest.fn(function (event, callback) {
        if (event === 'data') {
          callback(mockResponse);
        } else if (event === 'end') {
          callback();
        }
        return this;
      }),
    };

    http.get.mockImplementation((_, callback) => {
      callback({
        statusCode: 200,
        on: jest.fn(function (event, listener) {
          if (event === 'data') {
            listener(mockResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetRundownsWithoutItems(
      mockBaseUrl,
      mockToken,
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/rundown-without-items/'),
      expect.any(Function)
    );
    expect(result).toBeDefined();
  });

  it('should construct the correct URL without token', async () => {
    const mockEmitter = {
      on: jest.fn(function (event, callback) {
        if (event === 'end') {
          callback();
        }
        return this;
      }),
    };

    http.get.mockImplementation((_, callback) => {
      callback({
        statusCode: 200,
        on: jest.fn(function (event, listener) {
          if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    await sibHttpClientGetRundownsWithoutItems(
      mockBaseUrl,
      null, // No token
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/rundown-without-items/'),
      expect.any(Function)
    );
  });

  it('should include deviceId as query parameter in the URL', async () => {
    const mockEmitter = {
      on: jest.fn(function (event, callback) {
        if (event === 'end') {
          callback();
        }
        return this;
      }),
    };

    http.get.mockImplementation((_, callback) => {
      callback({
        statusCode: 200,
        on: jest.fn(function (event, listener) {
          if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    await sibHttpClientGetRundownsWithoutItems(
      mockBaseUrl,
      mockToken,
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringMatching(/\?deviceId=device_123/),
      expect.any(Function)
    );
  });

  it('should reject on HTTP error status code', async () => {
    const mockEmitter = {
      on: jest.fn(function () {
        return this;
      }),
    };

    http.get.mockImplementation((_, callback) => {
      callback({
        statusCode: 500,
        on: jest.fn(function () {
          return this;
        }),
      });
      return mockEmitter;
    });

    await expect(
      sibHttpClientGetRundownsWithoutItems(
        mockBaseUrl,
        mockToken,
        mockDeviceId
      )
    ).rejects.toThrow('HTTP Error 500');
  });
});
