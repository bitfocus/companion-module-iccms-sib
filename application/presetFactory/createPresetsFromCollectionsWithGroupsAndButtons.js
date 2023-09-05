import { createPresetFromButton } from './createPresetFromButton.js'

/**
 * Create presets from collection with groups and buttons.
 * Don't create presets for collections without buttons.
 *
 * NOTE: only one level of nesting is possible.
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} collections
 * @param {SibIcons} sibIcons
 * @returns {*} presets for setPresetDefinitions, <a href="https://github.com/bitfocus/companion-module-base/wiki/Presets">Presets</a>
 */
export function createPresetsFromCollectionsWithGroupsAndButtons(collections, sibIcons) {
	if (!Array.isArray(collections) || !collections) {
		return []
	}
	const presets = {}

	// Collections (can only have one parent category, use separator.)
	collections.forEach((qbCollection) => {
		// Groups
		qbCollection.Groups.forEach((qbGroup) => {
			const category = '[' + qbGroup.ButtonText + '] ' + qbGroup.ButtonText

			// Buttons in group.
			qbGroup.Buttons.forEach((qb) => {
				const presetQb = createPresetFromButton(category, qb, sibIcons)
				if (presetQb != null) {
					presets[`preset_qb_${qb.Id}`] = presetQb
				}
			})
		})
	})

	return presets
}
