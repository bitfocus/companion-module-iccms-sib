import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'

/**
 * Fixture for a single ApiRundownWithoutItemsDto object.
 * Usage: apiRundownWithoutItemsDtoFixture.create()
 */
export const apiRundownWithoutItemsDtoFixture = defineFixture((t) => {
  t['Id'].as(() => faker.number.int({ min: 1, max: 100 }))
  t['Order'].as(() => faker.number.int({ min: 1, max: 10 }))
  t['Name'].as(() => faker.lorem.words(2))
  t['ColorHex'].as(() => faker.color.rgb({ format: 'hex', casing: 'upper' }))
  t['IconId'].as(() => faker.string.alphanumeric(8))
  t['SvgIcon'].as(() => faker.string.alphanumeric(12))
})
