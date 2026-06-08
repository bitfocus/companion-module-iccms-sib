import { sibHttpClientGetTeams } from '../../../infrastructure/connection/sibHttpClient.js';
import * as http from 'http';
import { jest } from '@jest/globals';

jest.mock('http');

describe('sibHttpClientGetTeams', () => {
  const mockBaseUrl = 'localhost:8080';
  const mockToken = 'test_token';
  const mockDeviceId = 'device_123';
  const mockTeamsResponse = JSON.stringify([
    { id: 1, name: 'Team A' },
    { id: 2, name: 'Team B' },
  ]);

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
          if (event === 'data') {
            listener(mockTeamsResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetTeams(
      mockBaseUrl,
      mockToken,
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/teams/'),
      expect.any(Function)
    );
    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining(`${mockToken}`),
      expect.any(Function)
    );
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
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
          if (event === 'data') {
            listener(mockTeamsResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetTeams(
      mockBaseUrl,
      null, // No token
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/teams/'),
      expect.any(Function)
    );
    // When no token, URL should not contain the token (should just have the api path)
    const callUrl = http.get.mock.calls[0][0];
    expect(callUrl).toMatch(/\/api\/teams\/\?/);
    expect(result).toBeDefined();
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
          if (event === 'data') {
            listener(mockTeamsResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    await sibHttpClientGetTeams(
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
      sibHttpClientGetTeams(
        mockBaseUrl,
        mockToken,
        mockDeviceId
      )
    ).rejects.toThrow('HTTP Error 500');
  });

  it('should reject on HTTP 404 status code', async () => {
    const mockEmitter = {
      on: jest.fn(function () {
        return this;
      }),
    };

    http.get.mockImplementation((_, callback) => {
      callback({
        statusCode: 404,
        on: jest.fn(function () {
          return this;
        }),
      });
      return mockEmitter;
    });

    await expect(
      sibHttpClientGetTeams(
        mockBaseUrl,
        mockToken,
        mockDeviceId
      )
    ).rejects.toThrow('HTTP Error 404');
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
      sibHttpClientGetTeams(
        mockBaseUrl,
        mockToken,
        mockDeviceId
      )
    ).rejects.toThrow('Network error');
  });

  it('should parse teams data correctly', async () => {
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
          if (event === 'data') {
            listener(mockTeamsResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetTeams(
      mockBaseUrl,
      mockToken,
      mockDeviceId
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle empty teams list', async () => {
    const emptyResponse = JSON.stringify([]);
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
          if (event === 'data') {
            listener(emptyResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetTeams(
      mockBaseUrl,
      mockToken,
      mockDeviceId
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});
