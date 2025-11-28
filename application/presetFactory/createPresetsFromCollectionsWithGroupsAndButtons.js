import { createPresetFromButton } from './createPresetFromButton.js'

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

  // Helper to sanitize names (replace spaces with underscores)
  function sanitizeName(name) {
    return (name || '').replace(/\s+/g, '_')
  }

  collections.forEach((qbCollection) => {
    const collectionName = qbCollection.Text || 'Unnamed_Collection'
    const collectionId = qbCollection.Id || 'noid'
    const sanitizedCollectionName = sanitizeName(collectionName)
    qbCollection.Groups.forEach((qbGroup) => {
      const groupName = qbGroup.ButtonText || 'Unnamed_Group'
      const sanitizedGroupName = sanitizeName(groupName)
      const category = `QuickButtons/${sanitizedCollectionName}/${sanitizedGroupName}`

      // Header for the group
      const headerId = `header_${collectionId}_${qbGroup.Id || 'noid'}`
      presets[headerId] = {
        type: 'text',
        category,
        name: groupName,
        text: 'Move this button to the canvas to activate',
      }

      // Buttons in group
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
