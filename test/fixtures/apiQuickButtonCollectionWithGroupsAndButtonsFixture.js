import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import { apiQuickButtonGroupWithButtonsFixture } from './apiQuickButtonGroupWithButtonsFixture.js'
import { ICON_ID_CHOICES_FIXTURE } from './iconIdChoicesFixture.js'

/**
 * Factory fixture for creating test data of type {@link apiQuickButtonCollectionWithGroupsAndButtons}.
 *
 * Generates a complete quick button collection with groups and buttons for testing.
 * Creates a collection with 2 groups, each containing buttons with icons and colors.
 *
 * @returns {apiQuickButtonCollectionWithGroupsAndButtons} A collection object with nested groups and buttons.
 *          See {@link test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull.json} for example structure.
 *
 * @example
 * const collection = apiQuickButtonCollectionWithGroupsAndButtonsFixture.create();
 * // { Id: 42, Text: 'MyCollection', Groups: [...], BackgroundColorHex: '#FF00FF', ... }
 */
export const apiQuickButtonCollectionWithGroupsAndButtonsFixture = defineFixture((t) => {
  t['Id'].as(() => faker.number.int({ min: 1, max: 100 }))
  t['CollectionId'].as(() => faker.string.uuid())
  t['CollectionType'].as(() => faker.number.int({ min: 0, max: 2 }))
  t['Text'].as(() => faker.lorem.word())
  t['Order'].as(() => faker.number.int({ min: 0, max: 10 }))
  t['IconId'].as(() => faker.helpers.arrayElement(ICON_ID_CHOICES_FIXTURE))
  t['BackgroundColorHex'].as(() => faker.color.rgb({ format: 'hex', casing: 'upper' }))
  t['SvgIcon'].as(() => faker.string.alphanumeric(20))
  t['Groups'].as(() => [
    apiQuickButtonGroupWithButtonsFixture.create(),
    apiQuickButtonGroupWithButtonsFixture.create()
  ])
})
