import { apiQuickButtonCollectionWithGroupsAndButtons } from '../protocol/apiQuickButtonCollectionWithGroupsAndButtons.js'
import objectPath from 'object-path'
import { parseGroupsWithButtons } from './parseGroupsWithButtons.js'

/**
 * Parse collection with groups and buttons and correct serialization values.
 * Convert colors to look good in plugin.
 * @param {*} colWithGrpButtons
 * @returns {apiQuickButtonCollectionWithGroupsAndButtons}
 */
export function parseCollectionWithGroupsAndButtons(colWithGrpButtons) {
	let msgValue

	if (typeof colWithGrpButtons !== 'object') {
		return null
	}
	msgValue = colWithGrpButtons

	const id = objectPath.get(msgValue, 'Id', -1)
	const colType = objectPath.get(msgValue, 'CollectionType', 0)
	const text = objectPath.get(msgValue, 'Text', '')
	const order = objectPath.get(msgValue, 'Order', -1)
	const bgColor = objectPath.get(msgValue, 'BackgroundColorHex', '#000000')
	const iconId = objectPath.get(msgValue, 'IconId', '')
	const svgIcon = objectPath.get(msgValue, 'SvgIcon', '')
	const groups = objectPath.get(msgValue, 'Groups', [])

	let groupObjects = []

	groups.forEach((element) => {
		const grpObj = parseGroupsWithButtons(element)

		if (!Object.is(grpObj, null) && !Object.is(grpObj, undefined)) {
			groupObjects.push(grpObj)
		}
	})

	let apiObj = new apiQuickButtonCollectionWithGroupsAndButtons()

	apiObj.Id = id
	apiObj.CollectionType = colType
	apiObj.Text = text
	apiObj.Order = order
	apiObj.BackgroundColorHex = bgColor
	apiObj.IconId = iconId
	apiObj.SvgIcon = svgIcon
	apiObj.Groups = groupObjects

	return apiObj
}
