import { defineFixture } from 'efate'

/**
 * Fixture for ApiRundownWithoutItemsArray with 2 rundowns (realistic structure).
 * Usage: apiRundownWithoutItemsArray2Fixture.create()
 */
export const apiRundownWithoutItemsArray2Fixture = defineFixture((t) => {
  t['Rundowns'].as(() => [
    {
      Id: 7,
      Order: 1,
      Name: 'Id 7 - LightCoral',
      ColorHex: '#FF9999',
      IconId: 'rundown',
    },
    {
      Id: 6,
      Order: 2,
      Name: 'Id 5 - Rundown - Grey',
      ColorHex: '#000000',
      IconId: 'rundown',
    },
  ])
})
