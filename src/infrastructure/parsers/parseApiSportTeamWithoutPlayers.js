import objectPath from 'object-path'
import { ApiSportTeamWithoutPlayers } from '../sib-api/apiSportTeamWithoutPlayers.js'

/**
 * Parse groups with buttons and correct serialization values.
 * Convert colors to look good in plugin.
 * @param apiTeam
 * @returns {ApiSportTeamWithoutPlayers}
 * @param {*} apiTeam
 */
export function parseApiSportTeamWithoutPlayers(apiTeam) {
	if (typeof apiTeam == 'undefined') {
		return null
	}

	if (typeof apiTeam !== 'object') {
		return null
	}

	const msgValue = apiTeam

	const apiObj = new ApiSportTeamWithoutPlayers()

	const id = objectPath.get(msgValue, 'Id', -1)
	const tName = objectPath.get(msgValue, 'Name', '')
	const tShortName = objectPath.get(msgValue, 'ShortName', '')
	const tColor = objectPath.get(msgValue, 'TeamColorHex', '#000000')

	apiObj.Id = id
	apiObj.Name = tName
	apiObj.ShortName = tShortName
	apiObj.TeamColorHex = tColor

	return apiObj
}
