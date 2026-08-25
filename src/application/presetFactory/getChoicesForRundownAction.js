import { logger } from '../../logger.js'

/**
 * Returns choices for rundown action.
 * @param {ApiRundownWithoutItemsArray} rundownsArray - Infrastructure object containing rundowns
 * @returns {Array<{id: number, label: string}>}
 */
export function getChoicesForRundownAction(rundownsArray) {
	let options = []

	options.push({ id: -1, label: 'No rundown' })

	if (!rundownsArray) return options

	const allRundowns = rundownsArray.Rundowns

	if (!Array.isArray(allRundowns) || !allRundowns.length) {
		return options
	}

	allRundowns.forEach((eRundown) => {
		try {
			options.push({ id: eRundown.Id, label: eRundown.RundownName })
		} catch (e) {
			logger.error('choices rundown loop, %s.', e)
		}
	})

	return options
}
