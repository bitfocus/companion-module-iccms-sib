import { sibHttpClientRundownSelectPreviousItem } from '../../../infrastructure/connection/sibHttpClient.js';
import * as http from 'http';
import { jest } from '@jest/globals';

jest.mock('http');

describe('sibHttpClientRundownSelectPreviousItem', () => {
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

    const result = await sibHttpClientRundownSelectPreviousItem(
      mockBaseUrl,
      mockToken,
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/rundown/select-previous/'),
      expect.any(Function)
    );
    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining(`${mockToken}`),
      expect.any(Function)
    );
    expect(result).toBeUndefined();
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

    await sibHttpClientRundownSelectPreviousItem(
      mockBaseUrl,
      null, // No token
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/rundown/select-previous/'),
      expect.any(Function)
    );
    // When no token, URL should not contain the token (should just have the api path)
    const callUrl = http.get.mock.calls[0][0];
    expect(callUrl).toMatch(/\/api\/rundown\/select-previous\/\?/);
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

    await sibHttpClientRundownSelectPreviousItem(
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
      sibHttpClientRundownSelectPreviousItem(
        mockBaseUrl,
        mockToken,
        mockDeviceId
      )
    ).rejects.toThrow('HTTP Error 500');
  });

  it('should reject on request error', async () => {
    const mockEmitter = {
      on: jest.fn(function (event, callback) {
        if (event === 'error') {
          callback(new Error('Network error'));
        }
        return this;
      }),
    };

    http.get.mockImplementation(() => {
      return mockEmitter;
    });

    await expect(
      sibHttpClientRundownSelectPreviousItem(
        mockBaseUrl,
        mockToken,
        mockDeviceId
      )
    ).rejects.toThrow('Network error');
  });

  it('should resolve successfully with no content response', async () => {
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

    const result = await sibHttpClientRundownSelectPreviousItem(
      mockBaseUrl,
      mockToken,
      mockDeviceId
    );

    expect(result).toBeUndefined();
  });
});
