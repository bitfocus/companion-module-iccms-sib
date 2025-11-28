import { createPresetFromButton } from './createPresetFromButton.js'
import { combineRgb } from '@companion-module/base'
import { parseBgColorToPresetBgColor } from './parseBgColorToPresetBgColor.js'
import { getForegroundColorFromBackgroundColor } from './getForegroundColorFromBackgroundColor.js'
import { logger } from '../../logger.js'

/**
 * Create presets from collection with groups and buttons.
 * All presets are grouped under "QuickButtons/{collectionId}_{collectionName}/{groupName}".
 * Spaces in names are replaced with underscores.
 * Adds a header for each group.
 *
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} collections
 * @param {SibIcons} sibIcons
 * @returns {*} presets for setPresetDefinitions, <a href="https://github.com/bitfocus/companion-module-base/wiki/Presets">Presets</a>
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
    
    // Special case: if collection name is "QuickButtons", don't duplicate it
    const collectionCategory = sanitizedCollectionName === 'QuickButtons' 
      ? 'QuickButtons'
      : `QuickButtons/${sanitizedCollectionName}`
    
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
