import { logger } from '../../logger.js'

/**
 * Returns choices for action preset.
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} qbCollections
 * @returns {[]}
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
