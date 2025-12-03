import { sibHttpClientGetTeamLogo } from '../../../infrastructure/connection/sibHttpClient.js';
import { apiSportTeamLogoFixture } from '../../fixtures/apiSportTeamLogoFixture.js';
import { apiSportTeamLogoMinimalFixture } from '../../fixtures/apiSportTeamLogoMinimalFixture.js';
import * as http from 'http';
import { jest } from '@jest/globals';

jest.mock('http');

describe('sibHttpClientGetTeamLogo', () => {
  const mockBaseUrl = 'localhost:8080';
  const mockToken = 'test_token';
  const mockDeviceId = 'device_123';
  const mockTeamId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should construct the correct URL with token', async () => {
    const mockTeamLogo = apiSportTeamLogoFixture.create();
    const mockTeamLogoResponse = JSON.stringify(mockTeamLogo);

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
            listener(mockTeamLogoResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetTeamLogo(
      mockBaseUrl,
      mockTeamId,
      mockToken,
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/team-logo/'),
      expect.any(Function)
    );
    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining(`${mockTeamId}`),
      expect.any(Function)
    );
    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining(`${mockToken}`),
      expect.any(Function)
    );
    expect(result).toBeDefined();
    expect(result.id).toBe(mockTeamLogo.id);
    expect(result.ext).toBe(mockTeamLogo.ext);
  });

  it('should construct the correct URL without token', async () => {
    const mockTeamLogo = apiSportTeamLogoFixture.create();
    const mockTeamLogoResponse = JSON.stringify(mockTeamLogo);

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
            listener(mockTeamLogoResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetTeamLogo(
      mockBaseUrl,
      mockTeamId,
      null, // No token
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/team-logo/'),
      expect.any(Function)
    );
    // When no token, URL should not contain the token (should just have the api path)
    const callUrl = http.get.mock.calls[0][0];
    expect(callUrl).toMatch(/\/api\/team-logo\/1\/\?/);
    expect(result).toBeDefined();
  });

  it('should include deviceId as query parameter in the URL', async () => {
    const mockTeamLogo = apiSportTeamLogoFixture.create();
    const mockTeamLogoResponse = JSON.stringify(mockTeamLogo);

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
            listener(mockTeamLogoResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    await sibHttpClientGetTeamLogo(
      mockBaseUrl,
      mockTeamId,
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
      sibHttpClientGetTeamLogo(
        mockBaseUrl,
        mockTeamId,
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
      sibHttpClientGetTeamLogo(
        mockBaseUrl,
        mockTeamId,
        mockToken,
        mockDeviceId
      )
    ).rejects.toThrow('Network error');
  });

  it('should parse team logo data correctly using fixture', async () => {
    const mockTeamLogo = apiSportTeamLogoFixture.create();
    const mockTeamLogoResponse = JSON.stringify(mockTeamLogo);

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
            listener(mockTeamLogoResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetTeamLogo(
      mockBaseUrl,
      mockTeamId,
      mockToken,
      mockDeviceId
    );

    expect(result).toBeDefined();
    expect(result.id).toBe(mockTeamLogo.id);
    expect(result.ext).toBe(mockTeamLogo.ext);
    expect(result.logoBase64).toBe(mockTeamLogo.logoBase64);
  });


  it('should handle different team IDs', async () => {
    const teamId = 42;
    const mockTeamLogo = apiSportTeamLogoFixture.create();
    mockTeamLogo.id = teamId;
    const mockTeamLogoResponse = JSON.stringify(mockTeamLogo);

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
            listener(mockTeamLogoResponse);
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    const result = await sibHttpClientGetTeamLogo(
      mockBaseUrl,
      teamId,
      mockToken,
      mockDeviceId
    );

    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining(`/api/team-logo/${teamId}/`),
      expect.any(Function)
    );
    expect(result.id).toBe(teamId);
  });
});
