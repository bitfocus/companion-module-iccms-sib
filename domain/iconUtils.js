/**
 * Extracts all unique icon IDs from qbCollections and rundowns.
 * @param {apiQuickButtonCollectionWithGroupsAndButtons[]} qbCollections - QuickButton collections with groups and buttons.
 * @param {ApiRundownWithoutItemsArray} allRundowns - Rundowns array object.
 * @returns {Set<string>} Set of unique icon IDs.
 */
export function getAllUniqueIconIdsFromQbCollectionsAndRundowns(qbCollections, allRundowns) {
  const iconIds = new Set()

  // Extract from qbCollections (collections/groups/buttons)
  if (Array.isArray(qbCollections)) {
    qbCollections.forEach((col) => {
      if (col.IconId) iconIds.add(col.IconId)
      if (Array.isArray(col.Groups)) {
        col.Groups.forEach((group) => {
          if (group.IconId) iconIds.add(group.IconId)
          if (Array.isArray(group.Buttons)) {
            group.Buttons.forEach((button) => {
              if (button.IconId) iconIds.add(button.IconId)
            })
          }
        })
      }
    })
  }

  // Extract from rundowns (allRundowns.Rundowns[])
  if (allRundowns && Array.isArray(allRundowns.Rundowns)) {
    allRundowns.Rundowns.forEach((rundown) => {
      if (rundown.IconId) iconIds.add(rundown.IconId)
    })
  }

  return iconIds
}
