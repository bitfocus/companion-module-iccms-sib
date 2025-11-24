import { sibHttpClientGetTeamsAsync } from '../../../infrastructure/connection/sibHttpClient.js';
import * as http from 'http';
import { jest } from '@jest/globals';

jest.mock('http');

describe('sibHttpClientGetTeamsAsync', () => {
  const mockBaseUrl = 'localhost:8080';
  const mockToken = 'test_token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should construct the correct URL with token', async () => {
    const mockResponse = JSON.stringify([{ id: 1, name: 'Team 1' }]);
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

    const result = await sibHttpClientGetTeamsAsync(mockBaseUrl, mockToken);

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/teams/'),
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

    await sibHttpClientGetTeamsAsync(mockBaseUrl, null);

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/teams'),
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
      sibHttpClientGetTeamsAsync(mockBaseUrl, mockToken)
    ).rejects.toThrow();
  });
});
