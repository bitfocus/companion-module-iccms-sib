import { defineFixture } from 'efate'

/**
 * Fixture for an empty QuickButtonCollection array (no collections).
 * Usage: apiQuickButtonCollectionEmptyFixture.create()
 */
export const apiQuickButtonCollectionsEmptyArrayFixture = defineFixture((t) => {
  t.as(() => [])
})
