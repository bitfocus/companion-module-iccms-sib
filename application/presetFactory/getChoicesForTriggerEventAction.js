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

  // Helper to build ASCII-art prefix
  function makePrefix(levels) {
    // levels: array of booleans, each representing if the node at that level is last
    // Always use '└─ ' or '├─ ' for each level, matching test expectation
    let prefix = ''
    for (let i = 0; i < levels.length; ++i) {
      prefix += levels[i] ? '└─ ' : '├─ '
    }
    return prefix
  }

  qbCollections.forEach((collection, cIdx) => {
    const collectionName = collection.Text || `Collection ${cIdx + 1}`
    const collectionId = collection.CollectionId ?? collection.Id ?? `col_${cIdx}`
    const groups = Array.isArray(collection.Groups) ? collection.Groups : []
    const isLastCollection = cIdx === qbCollections.length - 1

    // Collection node
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
        label: makePrefix([isLastGroup]) + groupName,
      })

      buttons.forEach((button, bIdx) => {
        const buttonName = button.ButtonText || `Button ${bIdx + 1}`
        const eventId = button.EventId ?? 0
        const isLastButton = bIdx === buttons.length - 1

        // Button node
        options.push({
          id: eventId,
          label: makePrefix([isLastGroup, isLastButton]) + buttonName,
        })
      })
    })
  })

  return options
}
