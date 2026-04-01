import { combineRgb } from '@companion-module/base'
import { actionId } from '../actionId.js'
import { parseBgColorToPresetBgColor } from './parseBgColorToPresetBgColor.js'
import { getForegroundColorFromBackgroundColor } from './getForegroundColorFromBackgroundColor.js'
import { composeIconWithGradient } from '../../domain/imageProcessing.js'
import { logger } from '../../logger.js'

/**
 * Creates a Companion button preset definition from a SIB API quick button object.
 *
 * Transforms a SIB quick button (apiQuickButtonInGroup) into a Companion preset definition,
 * including style, icon, background/foreground color, and action mapping.
 * Used for generating presets from SIB quick button collections/groups.
 *
 * @param {string} parentCategoryId - Category path for the preset (e.g., "Pages/Collection/Group").
 * @param {apiQuickButtonInGroup} qb - Quick button object from the SIB API.
 * {@see test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull-QuickButton.json} for example structure.
 * @param {SibIcons} sibIcons - Icon resolver for fetching PNG icons by ID.
 * @returns {import('@companion-module/base').CompanionButtonPresetDefinition|null} Companion button preset definition for use with setPresetDefinitions, or null if input is invalid.
 *          See {@link https://github.com/bitfocus/companion-module-base/wiki/Presets} for preset format.
 */
export function createPresetFromButton(parentCategoryId, qb, sibIcons) {
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
		category: parentCategoryId,

		/**
		 * A name for the preset. Shown to the user when they hover over it.
		 * @example Fire events of End Of Match
		 */
		name: `Fire events of ${qb.ButtonText}`,

		// This is the minimal set of style properties you must define
		style: {
			// You can use variables from your module here
			text: qb.ButtonText,
			size: 14,
			alignment: 'center:bottom',
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
							[actionId.TriggerEvent]: qb.EventId,
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
		presetTriggerQb.style.png64 = composeIconWithGradient(sibIcons.getIconPngBase64(qb.IconId), qb.BackgroundColorHex)
	} else {
		logger.debug('Preset. Missing icon: %s', qb.IconId)
	}

	return presetTriggerQb
}
