import { logger } from '../../logger.js'

/**
 * Returns dropdown choices for QuickButton events for use in Companion actions.
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} qbCollections
 * @returns {Array}
 * @see test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull.json
 */
export function getChoicesForTriggerEventAction(qbCollections) {
	let options = []

	if (!qbCollections) return qbCollections

	if (!Array.isArray(qbCollections) || !qbCollections.length) {
		return []
	}

	options.push({ id: -1, label: 'Select QuickButton' })

	qbCollections.forEach((eCollection) => {
		try {
			eCollection.Groups.forEach((iGroup) => {
				iGroup.Buttons.forEach((iButton) => {
					options.push({ id: iButton.EventId, label: iButton.ButtonText })
				})
			})
		} catch (e) {
			logger.error('choices collections loop, %s.', e)
		}
	})

	return options
}
