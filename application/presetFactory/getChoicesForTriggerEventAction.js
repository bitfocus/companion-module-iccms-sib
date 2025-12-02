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
    // Simple mapping for common colors
    if (c.startsWith('FF0000')) return '🟥'
    if (c.startsWith('00FF00') || c.startsWith('00CC00')) return '🟩'
    if (c.startsWith('0000FF') || c.startsWith('0033CC')) return '🟦'
    if (c.startsWith('FFFF00')) return '🟨'
    if (c.startsWith('FFA500') || c.startsWith('FFCC99')) return '🟧'
    if (c.startsWith('800080') || c.startsWith('CC99FF')) return '🟪'
    if (c.startsWith('000000')) return '⬛'
    if (c.startsWith('FFFFFF')) return '⬜'
    return '⬛'
  }

  // Prefix for group level: folder emoji + EN SPACE
  function makeGroupPrefix() {
    return '\u2002' + '📁' + '\u2002'
  }

  // Prefix for button level: color + bullet + EN SPACE
  function makeButtonPrefix(bg) {
    return '\u2002' +colorEmoji(bg) + '•' + '\u2002'
  }

  qbCollections.forEach((collection, cIdx) => {
    const collectionName = collection.Text || `Collection ${cIdx + 1}`
    const collectionId = collection.CollectionId ?? collection.Id ?? `col_${cIdx}`
    const groups = Array.isArray(collection.Groups) ? collection.Groups : []
    const isLastCollection = cIdx === qbCollections.length - 1

    // Collection node (no prefix)
    options.push({
      id: `col_${collectionId}`,
      label: collectionName,
    })

    groups.forEach((group, gIdx) => {
      const groupName = group.ButtonText || `Group ${gIdx + 1}`
      const groupId = group.GroupId ?? group.Id ?? `grp_${gIdx}`
      const buttons = Array.isArray(group.Buttons) ? group.Buttons : []
      const isLastGroup = gIdx === groups.length - 1

      // Group node
      options.push({
        id: `col_${collectionId}_grp_${groupId}`,
        label: makeGroupPrefix() + groupName,
      })

      buttons.forEach((button, bIdx) => {
        const buttonName = button.ButtonText || `Button ${bIdx + 1}`
        const eventId = button.EventId ?? 0
        // Button node
        options.push({
          id: eventId,
          label: makeButtonPrefix(button.BackgroundColorHex) + buttonName,
        })
      })
    })
  })

  return options
}
