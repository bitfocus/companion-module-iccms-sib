import objectPath from 'object-path'
import { ApiMessageSibInfo } from '../protocol/apiMessageSibInfo.js'

/**
 * Parse groups with buttons and correct serialization values.
 * Convert colors to look good in plugin.
 * @param {*} apiSibInfo
 * @returns {ApiMessageSibInfo | null}
 */
export function parseApiMessageSibInfo(apiSibInfo) {
	if (typeof apiSibInfo == 'undefined') {
		return null
	}

	const apiObj = new ApiMessageSibInfo()

	const sibVersion = objectPath.get(apiSibInfo, 'SportInTheBoxVersion', '')
	const respData = objectPath.get(apiSibInfo, 'ResponseDate', '')
	const dbPath = objectPath.get(apiSibInfo, 'DatabasePath', '')

	apiObj.SportInTheBoxVersion = sibVersion
	apiObj.ResponseDate = respData
	apiObj.DatabasePath = dbPath

	return apiObj
}
