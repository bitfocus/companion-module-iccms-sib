import { sibHttpClientGetSibInfo } from '../../../infrastructure/connection/sibHttpClient.js';
import * as http from 'http';
import { jest } from '@jest/globals';
import {sibInfoWithComponentsFixture} from "../../fixtures/sibInfoWithComponentsFixture.js";

jest.mock('http');

describe('sibHttpClientGetSibInfo', () => {
  const mockBaseUrl = 'localhost:8080';
  const mockDeviceId = 'device_123';
  const mockResponseData = JSON.stringify({
    SportInTheBoxVersion: '2.8.7257.14899',
    ResponseDate: '2019-11-14T09:15:11',
    DatabasePath: 'E:\\SIB\\MySport.SIB2',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should construct the correct URL without token', async () => {
    // arrange
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
            listener(Buffer.from(mockResponseData));
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    // act
    await sibHttpClientGetSibInfo(
      mockBaseUrl,
      mockDeviceId
    );

    // assert
    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/hb/'),
      expect.any(Function)
    );
    expect(http.get).toHaveBeenCalledWith(
      expect.not.stringContaining('test_token'),
      expect.any(Function)
    );
  });

  it('should include deviceId as query parameter in the URL', async () => {
    // arrange
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
            listener(Buffer.from(mockResponseData));
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    // act
    await sibHttpClientGetSibInfo(
      mockBaseUrl,
      mockDeviceId
    );

    // assert
    expect(http.get).toHaveBeenCalledWith(
      expect.stringMatching(/\?deviceId=device_123/),
      expect.any(Function)
    );
  });

  it('should reject on request error', async () => {
    // arrange
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

    // act and assert
    await expect(
      sibHttpClientGetSibInfo(
        mockBaseUrl,
        mockDeviceId
      )
    ).rejects.toThrow('Network error');
  });

  it('should resolve successfully with valid response', async () => {
    // arrange
    const httpResponse = sibInfoWithComponentsFixture.create()

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
            listener(Buffer.from(JSON.stringify(httpResponse)));
          } else if (event === 'end') {
            listener();
          }
          return this;
        }),
      });
      return mockEmitter;
    });

    // act
    const result = await sibHttpClientGetSibInfo(
      mockBaseUrl,
      mockDeviceId
    );

    // assert
    expect(result).toBeDefined();
    expect(result).toEqual(httpResponse);
  });
});
