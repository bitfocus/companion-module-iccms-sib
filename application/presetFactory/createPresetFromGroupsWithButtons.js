import { combineRgb } from '@companion-module/base'
import { parseBgColorToPresetBgColor } from './parseBgColorToPresetBgColor.js'

/**
 * Create companion preset from qb collection with groups and buttons.
 * @param {string} parentCategoryId collection name with id
 * @param {apiQuickButtonGroupWithButtons} qbGroup
 * @param {SibIcons} sibIcons
 * @returns {{}|null}
 */
export function createPresetFromGroupsWithButtons(parentCategoryId, qbGroup, sibIcons) {
	if (typeof qbGroup == 'undefined') {
		return null
	}

	let bgClrInt = parseBgColorToPresetBgColor(qbGroup.BackgroundColorHex)

	const presetQbGroup = {
		/**
		 * This must be 'button' for now.
		 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/Input-Field-Types">Input Field Types</a>
		 */
		type: 'button',

		/**
		 * This groups presets into categories in the ui. Try to create logical groups to help users find presets.
		 * Collection is a top object and has no parent.
		 */
		category: '[' + parentCategoryId + '] ' + qbGroup.ButtonText,

		/**
		 * A name for the preset. Shown to the user when they hover over it.
		 */
		name: `Enter inside group to show buttons of ${qbGroup.ButtonText}`,

		// This is the minimal set of style properties you must define
		style: {
			// You can use variables from your module here
			text: qbGroup.ButtonText,
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [],
		feedbacks: [], // You can add some presets from your module here
	}

	// Override default if set.
	if (bgClrInt !== 16711680) {
		presetQbGroup.style.bgcolor = bgClrInt
	}

	return presetQbGroup
}
