import { createPresetFromButton } from './createPresetFromButton.js'
import { combineRgb } from '@companion-module/base'
import { parseBgColorToPresetBgColor } from './parseBgColorToPresetBgColor.js'
import { getForegroundColorFromBackgroundColor } from './getForegroundColorFromBackgroundColor.js'
import { logger } from '../../logger.js'

/**
 * Creates Companion preset definitions from SIB quick button collections.
 *
 * Transforms quick button collections into preset definitions organized by collection and group.
 * Creates headers for each collection and group with icons and colors, plus individual button presets.
 * Category structure: Pages > Collection > Group. Forward slashes in names are removed.
 *
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} collections - Array of collections from SIB API.
 *        Example: {@link test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull.json}
 * @param {SibIcons} sibIcons - Icon resolver for fetching PNG icons by ID.
 * @returns {Object} Preset definitions: collection headers, group headers, and button presets.
 *        See {@link https://github.com/bitfocus/companion-module-base/wiki/Presets} for format.
 */
export function createPresetsFromCollectionsWithGroupsAndButtons(collections, sibIcons) {
  if (!Array.isArray(collections) || !collections) {
    return {}
  }
  const presets = {}

  // Forward slashes are used as separators, remove them from names.
  function sanitizeName(name) {
    return (name || '').replace(/\//g, '')
  }

  collections.forEach((qbCollection) => {
    const collectionName = qbCollection.Text || 'Unnamed_Collection'
    const collectionId = qbCollection.Id || 'noid'
    const sanitizedCollectionName = sanitizeName(collectionName)
    
    // Special case: if collection name is "Pages", don't duplicate it
    const collectionCategory = sanitizedCollectionName === 'Pages'
      ? 'Pages'
      : `Pages/${sanitizedCollectionName}`
    
    // Parse background color for collection header
    let collectionBgClr = parseBgColorToPresetBgColor(qbCollection.BackgroundColorHex)
    let collectionFgColor = getForegroundColorFromBackgroundColor(collectionBgClr)
    
    // Create collection header
    const collectionHeaderId = `collection_header_${collectionId}`
    presets[collectionHeaderId] = {
      type: 'text',
      category: collectionCategory,
      name: collectionName,
      text: collectionName,
      style: {
        text: collectionName,
        size: 'auto',
        color: collectionFgColor,
        bgcolor: collectionBgClr,
        pngalignment: 'center:center',
      }
    }
    
    // Add icon if available
    if (sibIcons.hasIcon(qbCollection.IconId)) {
      presets[collectionHeaderId].style.png64 = sibIcons.getIconPngBase64(qbCollection.IconId)
    } else {
      logger.debug('Preset collection header. Missing icon: %s', qbCollection.IconId)
    }
    
    qbCollection.Groups.forEach((qbGroup) => {
      const groupName = qbGroup.ButtonText || 'Unnamed_Group'
      const groupId = qbGroup.Id || 'noid'
      
      // Parse background color for group header
      let bgClrInt = parseBgColorToPresetBgColor(qbGroup.BackgroundColorHex)
      let fgColor = getForegroundColorFromBackgroundColor(bgClrInt)
      
      // Create group header in the collection category
      const headerId = `header_${collectionId}_${groupId}`
      presets[headerId] = {
        type: 'text',
        category: collectionCategory,
        name: groupName,
        text: groupName,
        style: {
          text: groupName,
          size: 'auto',
          color: fgColor,
          bgcolor: bgClrInt,
          pngalignment: 'center:center',
        }
      }
      
      // Add icon if available
      if (sibIcons.hasIcon(qbGroup.IconId)) {
        presets[headerId].style.png64 = sibIcons.getIconPngBase64(qbGroup.IconId)
      } else {
        logger.debug('Preset header. Missing icon: %s', qbGroup.IconId)
      }

      // Individual buttons in group appear in the same category, right after the header
      qbGroup.Buttons.forEach((qb) => {
        const presetQb = createPresetFromButton(collectionCategory, qb, sibIcons)
        if (presetQb != null) {
          presets[`preset_qb_${qb.Id}`] = presetQb
        }
      })
    })
  })

  return presets
}
