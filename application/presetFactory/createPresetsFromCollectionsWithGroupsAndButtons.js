import { createPresetFromButton } from './createPresetFromButton.js'
import { combineRgb } from '@companion-module/base'

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
    
    qbCollection.Groups.forEach((qbGroup) => {
      const groupName = qbGroup.ButtonText || 'Unnamed_Group'
      const sanitizedGroupName = sanitizeName(groupName)
      const groupId = qbGroup.Id || 'noid'
      
      // Create group button under QuickButtons/CollectionName
      const groupCategory = `QuickButtons/${sanitizedCollectionName}`
      presets[`group_${collectionId}_${groupId}`] = {
        type: 'button',
        category: groupCategory,
        name: groupName,
        style: {
          text: groupName,
          size: 'auto',
          color: combineRgb(255, 255, 255),
          bgcolor: combineRgb(0, 0, 0),
        },
        steps: [{ down: [], up: [] }],
        feedbacks: [],
      }
      
      // Create buttons under group
      const buttonCategory = `${groupCategory}/${sanitizedGroupName}`

      // Header for the group
      const headerId = `header_${collectionId}_${groupId}`
      presets[headerId] = {
        type: 'text',
        category: buttonCategory,
        name: groupName,
        text: 'Move this button to the canvas to activate',
      }

      // Individual buttons in group
      qbGroup.Buttons.forEach((qb) => {
        const presetQb = createPresetFromButton(buttonCategory, qb, sibIcons)
        if (presetQb != null) {
          presets[`preset_qb_${qb.Id}`] = presetQb
        }
      })
    })
  })

  return presets
}
