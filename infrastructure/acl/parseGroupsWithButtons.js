import { apiQuickButtonGroupWithButtons } from '../protocol/apiQuickButtonGroupWithButtons.js'
import objectPath from 'object-path'
import { parseButtonInGroup } from './parseButtonInGroup.js'

/**
 * Parse groups with buttons and correct serialization values.
 * Convert colors to look good in plugin.
 * @param {*} grpButtons
 * @returns {apiQuickButtonGroupWithButtons}
 */
export function parseGroupsWithButtons(grpButtons) {
	let msgValue

	if (typeof grpButtons !== 'object') {
		return null
	}

	msgValue = grpButtons

	const id = objectPath.get(msgValue, 'Id', -1)
	const colType = objectPath.get(msgValue, 'CollectionType', 0)
	const text = objectPath.get(msgValue, 'ButtonText', '')
	const order = objectPath.get(msgValue, 'Order', -1)
	const bgColor = objectPath.get(msgValue, 'BackgroundColorHex', '#000000')
	const iconId = objectPath.get(msgValue, 'IconId', '')
	const svgIcon = objectPath.get(msgValue, 'SvgIcon', '')
	const buttons = objectPath.get(msgValue, 'Buttons', [])

	let buttonObjects = []

	buttons.forEach((element) => {
		const btnObj = parseButtonInGroup(element)
		if (!Object.is(btnObj, null) && !Object.is(btnObj, undefined)) {
			buttonObjects.push(btnObj)
		}
	})

	let apiObj = new apiQuickButtonGroupWithButtons()
	apiObj.Id = id
	apiObj.CollectionType = colType
	apiObj.ButtonText = text
	apiObj.Order = order
	apiObj.BackgroundColorHex = bgColor
	apiObj.IconId = iconId
	apiObj.SvgIcon = svgIcon
	apiObj.Buttons = buttonObjects

	return apiObj
}
