import {createPresetFromButton} from './createPresetFromButton.js'
import {parseBgColorToPresetBgColor} from './parseBgColorToPresetBgColor.js'
import {getForegroundColorFromBackgroundColor} from './getForegroundColorFromBackgroundColor.js'
import {logger} from '../../logger.js'

/**
 * Creates Companion preset definitions from SIB quick button collections.
 *
 * Transforms quick button collections into preset definitions organized by collection and group.
 * Creates headers for each collection and group with icons and colors, plus individual button presets.
 * Category structure: Pages > Collection > Group. Forward slashes in names are removed.
 *
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} collections - Array of collections from SIB API.
 *        Example: {@see test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull.json}
 * @param {SibIcons} sibIcons - Icon resolver for fetching PNG icons by ID.
 * @returns {Object} Preset definitions: collection headers, group headers, and button presets.
 *        See {@link https://github.com/bitfocus/companion-module-base/wiki/Presets} for format.
 */
export function createPresetsFromCollectionsWithGroupsAndButtons(collections, sibIcons) {

  logger.debug('createPresetsFromCollectionsWithGroupsAndButtons')

  if (!Array.isArray(collections) || !collections) {
    return {}
  }
  const presets = {}


  // Forward slashes are used as separators, remove them from names.
  function sanitizeName(name) {
    return (name || '').replace(/\//g, '')
  }

  const CATEGORY = 'Pages'

  collections.forEach((qbCollection) => {

    // Special case: CollectionType === 0 should not have Pages prefix
    const collectionCategory =
      qbCollection.CollectionType === 0
        ? sanitizeName(qbCollection.Text || 'Unnamed_Page')
        : `${CATEGORY}/${sanitizeName(qbCollection.Text || 'Unnamed_Page')}`
    const collectionId = qbCollection.Id || -1
    const collectionName = qbCollection.Text || 'Unnamed_Page'

    // Parse background color for the collection header
    let collectionBgClr = parseBgColorToPresetBgColor(qbCollection.BackgroundColorHex)
    let collectionFgColor = getForegroundColorFromBackgroundColor(collectionBgClr)

    // Create a collection header
    const collectionHeaderId = `collection_header_${collectionId}`
    presets[collectionHeaderId] = {
      type: 'text',
      category: collectionCategory,
      name: collectionName,
      text: "Contains all groups in the current page.",
      style: {
        text: collectionName,
        size: 'auto',
        color: collectionFgColor,
        bgcolor: collectionBgClr,
        pngalignment: 'center:center',
      }
    }

    // For each group in the collection, add a header and assign buttons to the group category
    if (Array.isArray(qbCollection.Groups)) {
      qbCollection.Groups.forEach((group) => {
        const groupName = group.ButtonText || 'Unnamed_Group'
        const sanitizedGroupName = sanitizeName(groupName)

        // // Add group header
        const groupHeaderId = `group_header_${collectionId}_${group.Id || sanitizedGroupName}`
        presets[groupHeaderId] = {
          type: 'text',
          category: collectionCategory,
          name: groupName,
          text: ""
        }

        // Add buttons for this group
        if (Array.isArray(group.Buttons)) {
          group.Buttons.forEach((button, idx) => {
            const buttonPreset = createPresetFromButton(collectionCategory, button, sibIcons)
            if (buttonPreset) {
              const buttonId = `button_${collectionId}_${group.Id || sanitizedGroupName}_${button.Id || idx}`
              presets[buttonId] = buttonPreset
            }
          })
        }
      })
    }
  })
  return presets
}
