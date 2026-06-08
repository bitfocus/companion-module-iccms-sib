import { defineFixture } from 'efate'

/**
 * Fixture for an empty RundownWithoutItemsArray (no rundowns).
 * Usage: apiRundownWithoutItemsArrayEmptyFixture.create()
 */
export const apiRundownWithoutItemsArrayEmptyFixture = defineFixture((t) => {
  t['Rundowns'].as(() => [])
})
