import objectPath from 'object-path'
import { apiQuickButtonInGroup } from '../protocol/apiQuickButtonInGroup.js'

/**
 * Parse groups with buttons and correct serialization values.
 * Convert colors to look good in plugin.
 * @param btnInGroup
 * @returns {apiQuickButtonInGroup}
 * @param {*} btnInGroup
 */
export function parseButtonInGroup(btnInGroup) {
	if (typeof btnInGroup == 'undefined') {
		return null
	}

	if (typeof btnInGroup !== 'object') {
		return null
	}

	const msgValue = btnInGroup

	const apiObj = new apiQuickButtonInGroup()

	const id = objectPath.get(msgValue, 'Id', -1)
	const eventId = objectPath.get(msgValue, 'EventId', -1)
	const buttonId = objectPath.get(msgValue, 'ButtonId', '')
	const text = objectPath.get(msgValue, 'ButtonText', '')
	const order = objectPath.get(msgValue, 'Order', -1)
	const bgColor = objectPath.get(msgValue, 'BackgroundColorHex', '#000000')
	const iconId = objectPath.get(msgValue, 'IconId', '')
	const svgIcon = objectPath.get(msgValue, 'SvgIcon', '')

	apiObj.Id = id
	apiObj.EventId = eventId
	apiObj.ButtonId = buttonId
	apiObj.ButtonText = text
	apiObj.Order = order
	apiObj.BackgroundColorHex = bgColor
	apiObj.IconId = iconId
	apiObj.SvgIcon = svgIcon

	return apiObj
}
