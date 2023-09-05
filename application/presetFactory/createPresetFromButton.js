import { combineRgb } from '@companion-module/base'
import { actionId } from '../actionId.js'
import { parseBgColorToPresetBgColor } from './parseBgColorToPresetBgColor.js'
import { getForegroundColorFromBackgroundColor } from './getForegroundColorFromBackgroundColor.js'
import { logger } from '../../logger.js'

/**
 * Create companion preset from qb collection with groups and buttons.
 * @param {string} parentGroupId group name with id
 * @param {apiQuickButtonInGroup} qb
 * @param {SibIcons} sibIcons
 * @returns {*} presets for setPresetDefinitions, <a href="https://github.com/bitfocus/companion-module-base/wiki/Presets">Presets</a>
 */
export function createPresetFromButton(parentGroupId, qb, sibIcons) {
	if (typeof qb == 'undefined') {
		return null
	}

	let bgClrInt = parseBgColorToPresetBgColor(qb.BackgroundColorHex)

	const presetTriggerQb = {
		/**
		 * This must be 'button' for now.
		 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/Input-Field-Types">Input Field Types</a>
		 */
		type: 'button',

		/**
		 * This groups presets into categories in the ui. Try to create logical groups to help users find presets.
		 * Collection is a top object and has no parent.
		 */
		category: parentGroupId,

		/**
		 * A name for the preset. Shown to the user when they hover over it.
		 * @example Fire events of End Of Match
		 */
		name: `Fire events of ${qb.ButtonText}`,

		// This is the minimal set of style properties you must define
		style: {
			// You can use variables from your module here
			text: qb.ButtonText,
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			pngalignment: 'center:center',
		},
		steps: [
			{
				down: [
					{
						// add an action on down press
						actionId: actionId.TriggerEvent,
						options: {
							[actionId.TriggerEvent]: qb.Id,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// Override default if set.
	if (bgClrInt !== 16711680) {
		presetTriggerQb.style.bgcolor = bgClrInt
	}

	presetTriggerQb.style.color = getForegroundColorFromBackgroundColor(bgClrInt)

	if (sibIcons.hasIcon(qb.IconId)) {
		presetTriggerQb.style.png64 = sibIcons.getIconPngBase64(qb.IconId)
	} else {
		logger.debug('Preset. Missing icon: %s', qb.IconId)
	}

	return presetTriggerQb
}
