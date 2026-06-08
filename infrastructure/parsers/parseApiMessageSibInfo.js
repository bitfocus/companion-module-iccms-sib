import objectPath from 'object-path'
import { ApiMessageSibInfo } from '../sib-api/apiMessageSibInfo.js'

/**
 * Parse groups with buttons and correct serialization values.
 * Convert colors to look good in the plugin.
 * @param {*} apiSibInfo
 * @returns {ApiMessageSibInfo | null}
 */
export function parseApiMessageSibInfo(apiSibInfo) {
  if (typeof apiSibInfo === 'undefined' || apiSibInfo === null) {
    return null
  }

  let obj = apiSibInfo
  if (typeof apiSibInfo === 'string') {
    try {
      obj = JSON.parse(apiSibInfo)
    } catch {
      return null
    }
  }

  const apiObj = new ApiMessageSibInfo()

  apiObj.SportInTheBoxVersion = objectPath.get(obj, 'SportInTheBoxVersion', '')
  apiObj.ResponseDate = objectPath.get(obj, 'ResponseDate', '')
  apiObj.DatabasePath = objectPath.get(obj, 'DatabasePath', '')
  apiObj.LogOnName = objectPath.get(obj, 'LogOnName', '')
  apiObj.ComponentLastModified = objectPath.get(obj, 'ComponentLastModified', { QuickButton: '', Rundown: '', Team: '' })

  return apiObj
}
