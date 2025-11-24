import objectPath from 'object-path'
import { ApiRundownWithoutItemsDto } from '../sib-api/ApiRundownWithoutItemsDto.js'

/**
 * Parse ApiRundownWithoutItemsDto and correct serialization values.
 * @param {*} rJson
 * @returns {ApiRundownWithoutItemsDto}
 */
export function parseApiRundownWithoutItemsDto(rJson) {
	if (typeof rJson !== 'object') {
		return null
	}

	const id = objectPath.get(rJson, 'Id', -1)
	const order = objectPath.get(rJson, 'Order', 0)
	const rundownName = objectPath.get(rJson, 'RundownName', '')
	const colorHex = objectPath.get(rJson, 'ColorHex', '')
	const iconId = objectPath.get(rJson, 'IconId', '')
	const svgIcon = objectPath.get(rJson, 'SvgIcon', '')

	return new ApiRundownWithoutItemsDto(id, order, rundownName, colorHex, iconId, svgIcon)
}
