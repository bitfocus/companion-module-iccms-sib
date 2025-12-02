import { logger } from '../../logger.js'

/**
 * Returns dropdown choices for QuickButton events for use in Companion actions,
 * with ASCII-art style labels showing the nested structure, padded for alignment.
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} qbCollections
 * @returns {Array}
 * @see test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull.json
 */
export function getChoicesForTriggerEventAction(qbCollections) {
  const options = []
  if (!Array.isArray(qbCollections) || !qbCollections.length) {
    return []
  }
  options.push({ id: -1, label: 'Select QuickButton' })
  options.push({ id: '__sep__', label: '────────────' })

  // Map hex color to colored emoji square
  function colorEmoji(hex) {
    if (!hex) return ''
    const c = hex.replace('#', '').toUpperCase()
    // Handle all fixture colors
    if (c.startsWith('000000')) return '◻️'
    if (c.startsWith('FF9999')) return '🟥'
    if (c.startsWith('FFCC99')) return '🟧'
    if (c.startsWith('FFFF99')) return '🟨'
    if (c.startsWith('99FF99')) return '🟩'
    if (c.startsWith('99CCFF')) return '🟦'
    if (c.startsWith('CC99FF')) return '🟪'
    if (c.startsWith('FF99FE')) return '🟫'
    return '◻️'
  }

  // Use EM SPACE (U+2003) for spacing
  const EM_SPACE = '\u2003'

  // Prefix for collection level: books emoji + EM SPACE
  function makeCollectionPrefix() {
    return '📚' + EM_SPACE
  }

  // Prefix for group level: color + EM SPACE + folder emoji + EM SPACE
  function makeGroupPrefix(bg) {
    return EM_SPACE + '◦' + EM_SPACE + '📁'
  }

  // Prefix for button level: color + EM SPACE + white bullet + EM SPACE
  function makeButtonPrefix(bg) {
    return EM_SPACE + '◦' + EM_SPACE + '◦' + EM_SPACE + colorEmoji(bg)
  }

  qbCollections.forEach((collection, cIdx) => {
    const collectionName = collection.Text || `Collection ${cIdx + 1}`
    const collectionId = collection.Id ?? `col_${cIdx}`
    const groups = Array.isArray(collection.Groups) ? collection.Groups : []

    // Collection node (with books prefix)
    options.push({
      id: `col_${collectionId}`,
      label: makeCollectionPrefix() + collectionName,
    })

    groups.forEach((group, gIdx) => {
      const groupName = group.ButtonText || `Group ${gIdx + 1}`
      const groupId = group.GroupId ?? group.Id ?? `grp_${gIdx}`
      const buttons = Array.isArray(group.Buttons) ? group.Buttons : []

      // Group node (with color and folder prefix)
      options.push({
        id: `col_${collectionId}_grp_${groupId}`,
        label: makeGroupPrefix(group.BackgroundColorHex) + groupName,
      })

      buttons.forEach((button, bIdx) => {
        const buttonName = button.ButtonText || `Button ${bIdx + 1}`
        const eventId = button.EventId ?? 0
        // Button node (with color and bullet prefix)
        options.push({
          id: eventId,
          label: makeButtonPrefix(button.BackgroundColorHex) + buttonName,
        })
      })
    })
  })

  return options
}
