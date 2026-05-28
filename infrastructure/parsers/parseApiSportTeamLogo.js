import objectPath from 'object-path'
import { ApiSportTeamLogo } from '../sib-api/apiSportTeamLogo.js'

/**
 * Parse team logo data from API response.
 * @param {*} apiTeamLogo
 * @returns {ApiSportTeamLogo | null}
 */
export function parseApiSportTeamLogo(apiTeamLogo) {
  if (typeof apiTeamLogo === 'undefined' || apiTeamLogo === null) {
    return null
  }

  let obj = apiTeamLogo
  if (typeof apiTeamLogo === 'string') {
    try {
      obj = JSON.parse(apiTeamLogo)
    } catch {
      return null
    }
  }

  const id = objectPath.get(obj, 'Id', -1)
  const ext = objectPath.get(obj, 'Ext', '')
  const logoBase64 = objectPath.get(obj, 'LogoBase64', '')

  return new ApiSportTeamLogo(id, ext, logoBase64)
}
