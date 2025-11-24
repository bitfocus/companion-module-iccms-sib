import { ApiRundownWithoutItemsArray } from '../sib-api/ApiRundownWithoutItemsArray.js'
import { parseApiRundownWithoutItemsDto } from './parseApiRundownWithoutItemsDto.js'

/**
 * Parse ApiRundownWithoutItemsArray and correct serialization values.
 * @param {*} rJson
 * @returns {ApiRundownWithoutItemsArray}
 */
export function parseApiRundownWithoutItemsArray(rJson) {
	if (!Array.isArray(rJson)) {
		return null
	}

	const arrayInstance = new ApiRundownWithoutItemsArray()
	const parsedRundowns = rJson.map(parseApiRundownWithoutItemsDto).filter(dto => dto !== null)
	arrayInstance.replace(parsedRundowns)

	return arrayInstance
}
