import { logger } from '../../logger.js'

/**
 * Returns choices for rundown action.
 * @param {ApiRundownWithoutItemsDto[]} allRundowns
 * @returns {[]}
 */
export function getChoicesForRundownAction(allRundowns) {
	let options = []

	options.push({ id: -1, label: 'No rundown' })

	if (!allRundowns) return options

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
