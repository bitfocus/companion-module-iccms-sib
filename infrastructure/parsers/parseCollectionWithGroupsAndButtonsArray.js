import { parseCollectionWithGroupsAndButtons } from './parseCollectionWithGroupsAndButtons.js'
import { logger } from '../../logger.js'

/**
 * Parse collection with groups and buttons and correct serialization values as array.
 * @param {*} collectionsJson
 * @returns {apiQuickButtonCollectionWithGroupsAndButtons[]}
 */
export function parseCollectionWithGroupsAndButtonsArray(collectionsJson) {
	let msgValue

	try {
		msgValue = JSON.parse(collectionsJson)
	} catch (e) {
		logger.debug('parse. %s.', e)
		msgValue = collectionsJson
	}

	// if (!Array.isArray(collectionsJson)) {
	// 	logger.error('collectionsJson is not array.')
	// 	return []
	// }

	let collectionObjects = []

	try {
		msgValue.forEach((element) => {
			try {
				const grpObj = parseCollectionWithGroupsAndButtons(element)
				if (!Object.is(grpObj, null) && !Object.is(grpObj, undefined)) {
					collectionObjects.push(grpObj)
				}
			} catch (e) {
				logger.error('Group. %s.', e)
			}
		})
	} catch (e) {
		logger.error('Collection loop. %s.', e)
	}

	//logger.warn(JSON.stringify(collectionObjects))

	//const jsonString = JSON.stringify(collectionObjects)
	//let parsed = JSON.parse(jsonString)

	//logger.warn(JSON.stringify(parsed))

	return collectionObjects
}
