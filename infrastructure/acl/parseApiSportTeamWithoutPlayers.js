import objectPath from 'object-path'
import { ApiSportTeamWithoutPlayers } from '../protocol/apiSportTeamWithoutPlayers.js'

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
	const logoBase64 = objectPath.get(msgValue, 'LogoBase64', '')
	const logoSmallBase64 = objectPath.get(msgValue, 'LogoSmallBase64', '')
	const tColor = objectPath.get(msgValue, 'TeamColorHex', '#000000')

	apiObj.Id = id
	apiObj.Name = tName
	apiObj.ShortName = tShortName
	apiObj.LogoBase64 = logoBase64
	apiObj.LogoSmallBase64 = logoSmallBase64
	apiObj.TeamColorHex = tColor

	return apiObj
}
