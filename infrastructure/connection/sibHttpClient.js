// noinspection HttpUrlsUsage

import { logger } from '../../logger.js'
import * as http from 'http'
import { ApiMessageSibInfo } from '../protocol/apiMessageSibInfo.js'
import { parseCollectionWithGroupsAndButtonsArray } from '../acl/parseCollectionWithGroupsAndButtonsArray.js'
import { ApiSportTeamWithoutPlayers } from '../protocol/apiSportTeamWithoutPlayers.js'

import { parseApiSportTeamWithoutPlayersArray } from '../acl/parseApiSportTeamWithoutPlayersArray.js'

const apiHttp = 'http://'
const apiHb = '/api/hb/'
const apiQuickButton = '/api/quickbutton'
const apiQuickButtonCollectionsFull = '/api/quickButtonCollectionsFull/'
const apiIcon = '/api/iconPng/'
const apiTeams = '/api/teams/'
const apiTeam = '/api/team/'
const apiMatch = '/api/match/'

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
 * @param baseUrl
 * @returns {Promise<ApiMessageSibInfo>}
 */
export function sibHttpClientGetSibInfoAsync(baseUrl) {
	return new Promise((resolve, reject) => {
		const fullUrl = apiHttp + baseUrl + apiHb

		logger.debug('Called url: ' + fullUrl)

		http
			.get(fullUrl, (res) => {
				let chunks_of_data = []

				res.on('data', (chunk) => {
					chunks_of_data.push(chunk)
				})
				res.on('end', () => {
					try {
						logger.debug('Got db info from api.')

						let response_body = Buffer.concat(chunks_of_data)
						resolve(response_body.toString())
					} catch (e) {
						logger.warn(`API. Db info end: %s.`, e.message)
						reject(e)
					}
				})
			})
			.on('error', (e) => {
				logger.warn(`API. Db info error: %s.`, e.message)
				reject(e)
			})
	})
}

/**
 * Gets all collections with groups and buttons at once.
 * @param {string} baseUrl
 * @param {string} token
 * @returns {Promise<apiQuickButtonCollectionWithGroupsAndButtons[]>}
 */
export function sibHttpClientGetQuickButtonCollectionsAsync(baseUrl, token) {
	return new Promise((resolve, reject) => {
		let urlQb
		if (!passIsSet(token)) {
			// http://localhost:8080/api/iconPng/action
			urlQb = apiHttp + baseUrl + apiQuickButtonCollectionsFull
		} else {
			// http://localhost:8080/api/iconPng/action/my_pass
			urlQb = apiHttp + baseUrl + apiQuickButtonCollectionsFull + token + '/'
		}

		logger.debug('Called url: ' + urlQb)

		let apiData

		http
			.get(urlQb, (res) => {
				let rawData = ''
				res.on('data', (chunk) => {
					rawData += chunk
				})
				res.on('end', () => {
					try {
						logger.debug('Got collections from api.')
						apiData = parseCollectionWithGroupsAndButtonsArray(rawData)
						resolve(apiData)
					} catch (e) {
						logger.warn("API, can't parse qb collection from API: %s.", e.message)
						reject(e)
					}
				})
			})
			.on('error', (e) => {
				logger.error("API, can't get qb collection from API: %s.", e.message)
				reject(e)
			})
	})
}

/**
 * Get BASE&¤ encoded png icon from sib instance by id.
 * @param {string} baseUrl
 * @param {string} token
 * @param {string} iconId matches QuickButtonIconId class in sib
 * @returns {Promise<string>}
 */
export function sibHttpClientGetPngIconBase64(baseUrl, token, iconId) {
	return new Promise((resolve, reject) => {
		const iconBase64 = convertIconIdToBase64(iconId)

		let urlIcon
		if (!passIsSet(token)) {
			urlIcon = apiHttp + baseUrl + apiIcon + iconBase64
		} else {
			urlIcon = apiHttp + baseUrl + apiIcon + iconBase64 + '/' + token
		}

		logger.debug('Called url: ' + urlIcon)

		http
			.get(urlIcon, (res) => {
				let chunks_of_data = []

				if (res.statusCode === 400) {
					logger.warn('API. 400. Icon: %s, url: %s: ', iconId, urlIcon)
					reject(400)
				}

				if (res.statusCode === 404) {
					logger.warn('API. 404. Icon: %s, url: %s: ', iconId, urlIcon)
					reject(404)
				}

				res.on('data', (chunk) => {
					chunks_of_data.push(chunk)
				})
				res.on('end', () => {
					try {
						logger.debug('API. Got icon: %s, url: %s: ', iconId, urlIcon)

						let response_body = Buffer.concat(chunks_of_data)
						const responseString = response_body.toString()
						resolve(responseString)
					} catch (e) {
						logger.warn('API. Icon end: ' + iconId + ' ' + e.message)
						reject(e)
					}
				})
			})
			.on('error', (e) => {
				logger.error('API. Icon: ' + iconId + ' ' + e.message)
				reject(e)
			})
	})
}

/**
 * Gets all teams at once.
 * @param {string} baseUrl
 * @param {string} token
 * @returns {Promise<ApiSportTeamWithoutPlayers[]>}
 */
export function sibHttpClientGetTeamsAsync(baseUrl, token) {
	return new Promise((resolve, reject) => {
		let urlTeams
		if (!passIsSet(token)) {
			// http://localhost:8080/api/teams
			urlTeams = apiHttp + baseUrl + apiTeams
		} else {
			// http://localhost:8080/api/teams/my_pass
			urlTeams = apiHttp + baseUrl + apiTeams + token + '/'
		}

		logger.debug('Called url: ' + urlTeams)

		let apiData

		http
			.get(urlTeams, (res) => {
				let rawData = ''
				res.on('data', (chunk) => {
					rawData += chunk
				})
				res.on('end', () => {
					try {
						logger.debug('Got teams from api.')

						apiData = parseApiSportTeamWithoutPlayersArray(rawData)
						resolve(apiData)
					} catch (e) {
						logger.warn("API, can't parse teams from API: %s.", e.message)
						reject(e)
					}
				})
			})
			.on('error', (e) => {
				logger.error("API, can't get teams from API: %s.", e.message)
				reject(e)
			})
	})
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
