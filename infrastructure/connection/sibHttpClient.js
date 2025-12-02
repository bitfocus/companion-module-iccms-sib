// noinspection HttpUrlsUsage

import {logger} from '../../logger.js'
import * as http from 'http'
import {ApiMessageSibInfo} from '../sib-api/apiMessageSibInfo.js'
import {parseCollectionWithGroupsAndButtonsArray} from '../parsers/parseCollectionWithGroupsAndButtonsArray.js'
import {ApiSportTeamWithoutPlayers} from '../sib-api/apiSportTeamWithoutPlayers.js'

import {parseApiSportTeamWithoutPlayersArray} from '../parsers/parseApiSportTeamWithoutPlayersArray.js'
import {parseApiRundownWithoutItemsArray} from '../parsers/parseApiRundownWithoutItemsArray.js'

const apiHttp = 'http://'
const apiHb = '/api/hb/'
const apiQuickButton = '/api/quickbutton'
const apiQuickButtonCollectionsFull = '/api/quickButtonCollectionsFull/'
const apiIcon = '/api/iconPng/'
const apiTeams = '/api/teams/'
const apiTeam = '/api/team/'
const apiMatch = '/api/match/'
const apiRundownWithoutItems = '/api/rundown-without-items/'
const apiRundownSelectedRun = '/api/rundown/selected-run/'
const apiRundownCurrentSelectPrevious = '/api/rundown/select-previous/'
const apiRundownCurrentSelectNext = '/api/rundown/select-next/'
const apiRundownSelect = '/api/rundown/select-rundown/'

function passIsSet(value) {
  if (value === undefined) {
    return false
  } else if (value === null) {
    return false
  } else if (value.trim() === '') {
    return false
  } else if (value.length === 0) {
    return false
  }
  return true
}

/**
 * Convert sib icon id to base64 string.
 * Need because it is passed as 'flat/flat_web_design/our_team2' and it gives invalid url
 * @param iconId
 * @returns {string}
 */
export function convertIconIdToBase64(iconId) {
  return btoa(iconId)
}

/**
 * Calls SIB api and triggers event via HTTP get.
 * {@link https://nodejs.org/api/http.html#httpgetoptions-callback Node http}.
 * @param {string} baseUrl rest base url from config without ending slash.
 * @param {number} triggerId
 * @param {string} token
 */
export function sibHttpClientTriggerQuickButtonById(baseUrl, triggerId, token) {
  let fullUrl

  if (!passIsSet(token)) {
    fullUrl = apiHttp + baseUrl + apiQuickButton + '/trig/' + triggerId
  } else {
    fullUrl = apiHttp + baseUrl + apiQuickButton + '/trig/' + triggerId + '/' + token
  }

  logger.debug('Trigger url: ' + fullUrl)

  http.get(fullUrl).on('error', (err) => {
    logger.error('Error for id: ' + triggerId + ' ' + err.message)
  })
}

/**
 * Gets current db info from api.
 * @param {string} baseUrl - Base URL of the API.
 * @param {string} deviceId - Device ID for authentication.
 * @returns {Promise<string>} Raw JSON string response
 */
export async function sibHttpClientGetSibInfo(baseUrl, deviceId) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(apiHttp + baseUrl);
      // http://localhost:8080/api/hb/
      url.pathname = apiHb;

      // Add deviceId as query parameter if available
      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      let chunks_of_data = [];

      http
        .get(url.toString(), (res) => {
          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Url: %s', res.statusCode, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('data', (chunk) => {
            chunks_of_data.push(chunk);
          });

          res.on('end', () => {
            try {
              logger.debug('API. Got db info from API. Url: %s', url.toString());
              const response_body = Buffer.concat(chunks_of_data);
              resolve(response_body.toString());
            } catch (e) {
              logger.warn('API. Db info processing error: %s', e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error("API, can't get db info from API: %s.", e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s.', e.message);
      reject(e);
    }
  });
}

/**
 * Gets all quick button collections with groups and buttons from the SIB API.
 *
 * Fetches the complete quick button collection structure including nested groups and buttons.
 * Each collection contains groups, and each group contains buttons with icons and styling.
 * Returns an array of collections that can be used to generate presets.
 *
 * @param {string} baseUrl - Base URL of the API (e.g., 'localhost:8080').
 * @param {string} token - Authentication token. If not set, requests are made without the token.
 * @param {string} deviceId - Device ID for authentication as query parameter.
 * @returns {Promise<apiQuickButtonCollectionWithGroupsAndButtons[]>} Array of collections with nested groups and buttons.
 *          See {@link ../test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull.json} for example data structure.
 *
 * @example
 * const collections = await sibHttpClientGetQuickButtonCollectionsAsync('localhost:8080', 'token123', 'device-id');
 * collections.forEach(collection => {
 *   console.log(collection.Text); // Collection name
 *   collection.Groups.forEach(group => {
 *     console.log(group.ButtonText); // Group name
 *     group.Buttons.forEach(button => {
 *       console.log(button.ButtonText); // Button name
 *     });
 *   });
 * });
 */
export async function sibHttpClientGetQuickButtonCollectionsAsync(baseUrl, token, deviceId) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(apiHttp + baseUrl);

      if (!passIsSet(token)) {
        // http://localhost:8080/api/quickButtonCollectionsFull/
        url.pathname = apiQuickButtonCollectionsFull;
      } else {
        // http://localhost:8080/api/quickButtonCollectionsFull/my_pass
        url.pathname = `${apiQuickButtonCollectionsFull}${token}/`;
      }

      // Add deviceId as query parameter if available
      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      let rawData = '';

      http
        .get(url.toString(), (res) => {
          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Url: %s', res.statusCode, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('data', (chunk) => {
            rawData += chunk;
          });

          res.on('end', () => {
            try {
              logger.debug('API. Got collections from API. Url: %s', url.toString());
              const apiData = parseCollectionWithGroupsAndButtonsArray(rawData);
              resolve(apiData);
            } catch (e) {
              logger.warn("API, can't parse qb collection from API: %s.", e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error("API, can't get qb collection from API: %s.", e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s.', e.message);
      reject(e);
    }
  });
}

/**
 * Get BASE64-encoded PNG icon from SIB instance by icon id.
 *
 * @param {string} baseUrl - Base URL of the API.
 * @param {string} token - Authentication token.
 * @param {string} iconId - Icon ID (matches QuickButtonIconId class in SIB).
 * @param {string} deviceId - Plugin/device ID for authentication.
 * @param {number} [width=72] - Optional icon width in pixels. Default is 72. Use 72 for both square and rectangular icons.
 * @param {number} [height=58] - Optional icon height in pixels. Default is 58. Use 72 for square icons, 58 for rectangular icons.
 * @returns {Promise<string>} Base64-encoded PNG image data.
 *
 * @example
 * // Default (rectangular, 72x58)
 * sibHttpClientGetPngIconBase64(baseUrl, token, iconId, deviceId)
 * // Square icon (72x72)
 * sibHttpClientGetPngIconBase64(baseUrl, token, iconId, deviceId, 72, 72)
 */
export function sibHttpClientGetPngIconBase64(baseUrl, token, iconId, deviceId, width = 72, height = 58) {
  return new Promise((resolve, reject) => {
    try {
      const iconBase64 = convertIconIdToBase64(iconId);

      // Construct URL using URL class
      const url = new URL(apiHttp + baseUrl + apiIcon + iconBase64);
      if (passIsSet(token)) {
        url.pathname += `/${token}`;
      }

      url.searchParams.append('w', String(width));
      url.searchParams.append('h', String(height));

      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      http
        .get(url.toString(), (res) => {
          let chunks_of_data = [];

          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Icon: %s, url: %s', res.statusCode, iconId, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('data', (chunk) => {
            chunks_of_data.push(chunk);
          });

          res.on('end', () => {
            try {
              logger.debug('API. Got icon: %s, url: %s', iconId, url.toString());
              const response_body = Buffer.concat(chunks_of_data);
              resolve(response_body.toString());
            } catch (e) {
              logger.warn('API. Icon processing error: %s, url: %s', e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error('API. Icon request error: %s, url: %s', e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s', e.message);
      reject(e);
    }
  });
}

/**
 * Gets all teams at once.
 * @param {string} baseUrl - Base URL of the API.
 * @param {string} token - Authentication token.
 * @param {string} deviceId - Device ID for authentication.
 * @returns {Promise<ApiSportTeamWithoutPlayers[]>}
 */
export async function sibHttpClientGetTeams(baseUrl, token, deviceId) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(apiHttp + baseUrl);

      if (!passIsSet(token)) {
        // http://localhost:8080/api/teams
        url.pathname = apiTeams;
      } else {
        // http://localhost:8080/api/teams/my_pass
        url.pathname = `${apiTeams}${token}/`;
      }

      // Add deviceId as query parameter if available
      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      let rawData = '';

      http
        .get(url.toString(), (res) => {
          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Url: %s', res.statusCode, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('data', (chunk) => {
            rawData += chunk;
          });

          res.on('end', () => {
            try {
              logger.debug('Got teams from api.');
              const apiData = parseApiSportTeamWithoutPlayersArray(rawData);
              resolve(apiData);
            } catch (e) {
              logger.warn("API, can't parse teams from API: %s.", e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error("API, can't get teams from API: %s.", e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s.', e.message);
      reject(e);
    }
  });
}

/**
 * Calls SIB api and changes home or guest team via HTTP get.
 * {@link https://nodejs.org/api/http.html#httpgetoptions-callback Node http}.
 * @param {string} baseUrl rest base url from config without ending slash.
 * @param {string} teamType - home/h or guest/g
 * @param {number} teamOid
 * @param {string} token
 */
export function sibHttpClientChangeTeamById(baseUrl, teamType, teamOid, token) {
  let fullUrl

  if (!passIsSet(token)) {
    // http://localhost:8080/api/match/team/h/1/
    fullUrl = apiHttp + baseUrl + apiMatch + '/team/' + teamType + '/' + teamOid + '/'
  } else {
    //http://localhost:8080/api/match/team/h/1/my_pass
    fullUrl = apiHttp + baseUrl + apiMatch + '/team/' + teamType + '/' + teamOid + '/' + token
  }

  logger.debug('Change team url: ' + fullUrl)

  http.get(fullUrl).on('error', (err) => {
    logger.error('Error for team: ' + teamType + ' ' + teamOid + ' ' + err.message)
  })
}

/**
 * Gets all rundowns without items.
 * @param {string} baseUrl - Base URL of the API.
 * @param {string} token - Authentication token.
 * @param {string} deviceId - Device ID for authentication.
 * @returns {Promise<ApiRundownWithoutItemsDto[]>}
 */
export async function sibHttpClientGetRundownsWithoutItems(baseUrl, token, deviceId) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(apiHttp + baseUrl);

      if (!passIsSet(token)) {
        // http://localhost:8080/api/rundown-without-items/
        url.pathname = apiRundownWithoutItems;
      } else {
        // http://localhost:8080/api/rundown-without-items/my_pass
        url.pathname = `${apiRundownWithoutItems}${token}/`;
      }

      // Add deviceId as query parameter if available
      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      let rawData = '';

      http
        .get(url.toString(), (res) => {
          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Url: %s', res.statusCode, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('data', (chunk) => {
            rawData += chunk;
          });

          res.on('end', () => {
            try {
              logger.debug('Got rundowns without items data from API.');
              const apiData = parseApiRundownWithoutItemsArray(rawData);
              resolve(apiData);
            } catch (e) {
              logger.warn("API, can't parse rundowns without items from API: %s.", e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error("API, can't get rundowns without items from API: %s.", e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s.', e.message);
      reject(e);
    }
  });
}

/**
 * Calls SIB api and runs currently selected item on rundown id.
 * @param {string} baseUrl - Base URL of the API.
 * @param {number} rundownId - The rundown ID to trigger.
 * @param {string} token - Authentication token.
 * @param {string} deviceId - Device ID for authentication.
 * @returns {Promise<void>}
 */
export async function sibHttpClientRundownSelectedItemRun(baseUrl, rundownId, token, deviceId) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(apiHttp + baseUrl);

      if (!passIsSet(token)) {
        // http://localhost:8080/api/rundown/selected-run/4
        url.pathname = `${apiRundownSelectedRun}${rundownId}/`;
      } else {
        // http://localhost:8080/api/rundown/selected-run/4/my_pass
        url.pathname = `${apiRundownSelectedRun}${rundownId}/${token}`;
      }

      // Add deviceId as query parameter if available
      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      http
        .get(url.toString(), (res) => {
          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Url: %s', res.statusCode, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('end', () => {
            try {
              logger.debug('API. Rundown selected item run triggered successfully. Url: %s', url.toString());
              resolve();
            } catch (e) {
              logger.warn('API. Rundown selected item run error: %s', e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error("API, can't trigger rundown selected item run: %s.", e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s.', e.message);
      reject(e);
    }
  });
}

/**
 * Calls SIB api and selects previous item in current rundown.
 * @param {string} baseUrl - Base URL of the API.
 * @param {string} token - Authentication token.
 * @param {string} deviceId - Device ID for authentication.
 * @returns {Promise<void>}
 */
export async function sibHttpClientRundownSelectPreviousItem(baseUrl, token, deviceId) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(apiHttp + baseUrl);

      if (!passIsSet(token)) {
        // http://localhost:8080/api/rundown/select-previous/
        url.pathname = apiRundownCurrentSelectPrevious;
      } else {
        // http://localhost:8080/api/rundown/select-previous/my_pass
        url.pathname = `${apiRundownCurrentSelectPrevious}${token}`;
      }

      // Add deviceId as query parameter if available
      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      http
        .get(url.toString(), (res) => {
          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Url: %s', res.statusCode, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('end', () => {
            try {
              logger.debug('API. Rundown select previous item triggered successfully. Url: %s', url.toString());
              resolve();
            } catch (e) {
              logger.warn('API. Rundown select previous item error: %s', e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error("API, can't trigger rundown select previous item: %s.", e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s.', e.message);
      reject(e);
    }
  });
}

/**
 * Calls SIB api and selects next item in current rundown.
 * @param {string} baseUrl - Base URL of the API.
 * @param {string} token - Authentication token.
 * @param {string} deviceId - Device ID for authentication.
 * @returns {Promise<void>}
 */
export async function sibHttpClientRundownSelectNextItem(baseUrl, token, deviceId) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(apiHttp + baseUrl);

      if (!passIsSet(token)) {
        // http://localhost:8080/api/rundown/select-next/
        url.pathname = apiRundownCurrentSelectNext;
      } else {
        // http://localhost:8080/api/rundown/select-next/my_pass
        url.pathname = `${apiRundownCurrentSelectNext}${token}`;
      }

      // Add deviceId as query parameter if available
      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      http
        .get(url.toString(), (res) => {
          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Url: %s', res.statusCode, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('end', () => {
            try {
              logger.debug('API. Rundown select next item triggered successfully. Url: %s', url.toString());
              resolve();
            } catch (e) {
              logger.warn('API. Rundown select next item error: %s', e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error("API, can't trigger rundown select next item: %s.", e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s.', e.message);
      reject(e);
    }
  });
}

/**
 * Calls SIB api and selects rundown in gui by id.
 * @param {string} baseUrl - Base URL of the API.
 * @param {number} rundownId - The rundown ID to select.
 * @param {string} token - Authentication token.
 * @param {string} deviceId - Device ID for authentication.
 * @returns {Promise<void>}
 */
export async function sibHttpClientRundownSelect(baseUrl, rundownId, token, deviceId) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(apiHttp + baseUrl);

      if (!passIsSet(token)) {
        // http://localhost:8080/api/rundown/select-rundown/1
        url.pathname = `${apiRundownSelect}${rundownId}/`;
      } else {
        // http://localhost:8080/api/rundown/select-rundown/1/my_pass
        url.pathname = `${apiRundownSelect}${rundownId}/${token}`;
      }

      // Add deviceId as query parameter if available
      if (passIsSet(deviceId)) {
        url.searchParams.append('deviceId', deviceId);
      }

      logger.debug('Called url: ' + url.toString());

      http
        .get(url.toString(), (res) => {
          // Reject on any non-2xx status code
          if (res.statusCode < 200 || res.statusCode >= 300) {
            logger.error('API. HTTP Error %s. Url: %s', res.statusCode, url.toString());
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }

          res.on('end', () => {
            try {
              logger.debug('API. Rundown select triggered successfully. Url: %s', url.toString());
              resolve();
            } catch (e) {
              logger.warn('API. Rundown select error: %s', e.message);
              reject(e);
            }
          });
        })
        .on('error', (e) => {
          logger.error("API, can't trigger rundown select: %s.", e.message);
          reject(e);
        });
    } catch (e) {
      logger.error('Error constructing URL or making request: %s.', e.message);
      reject(e);
    }
  });
}
