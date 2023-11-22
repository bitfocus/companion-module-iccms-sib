import { logger } from '../../logger.js'
import { parseApiSportTeamWithoutPlayers } from './parseApiSportTeamWithoutPlayers.js'

/**
 * Parse teams as array.
 * Convert colors to look good in plugin.
 * @param apiTeams
 * @returns {ApiSportTeamWithoutPlayers[]}
 * @param {*} apiTeams
 */
export function parseApiSportTeamWithoutPlayersArray(apiTeams) {
	let msgValue

	try {
		msgValue = JSON.parse(apiTeams)
	} catch (e) {
		logger.debug('parse. %s.', e)
		msgValue = apiTeams
	}

	let collectionObjects = []

	try {
		msgValue.forEach((element) => {
			try {
				const grpObj = parseApiSportTeamWithoutPlayers(element)
				if (!Object.is(grpObj, null) && !Object.is(grpObj, undefined)) {
					collectionObjects.push(grpObj)
				}
			} catch (e) {
				logger.error('Team. %s.', e)
			}
		})
	} catch (e) {
		logger.error('Collection loop. %s.', e)
	}

	return collectionObjects
}
