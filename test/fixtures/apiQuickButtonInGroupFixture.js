import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import { ICON_ID_CHOICES_FIXTURE } from './iconIdChoicesFixture.js'

/**
 * Factory fixture for creating test data of type {@link apiQuickButtonInGroup}.
 *
 * Generates a single quick button for testing within a group context.
 * Creates a button with icon, text, color, and event ID.
 *
 * @returns {apiQuickButtonInGroup} A button object with all button properties.
 *          See {@link test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull.json} for example structure.
 *
 * @example
 * const button = apiQuickButtonInGroupFixture.create();
 * // { Id: 42, ButtonText: 'My Button', IconId: 'action', BackgroundColorHex: '#FF00FF', ... }
 */
export const apiQuickButtonInGroupFixture = defineFixture((t) => {
  t['Id'].as(() => faker.number.int({ min: 1, max: 100 }))
  t['EventId'].as(() => faker.number.int({ min: 1, max: 100 }))
  t['ButtonId'].as(() => faker.string.uuid())
  t['ButtonText'].as(() => faker.lorem.words(3))
  t['Order'].as(() => faker.number.int({ min: 0, max: 10 }))
  t['IconId'].as(() => faker.helpers.arrayElement(ICON_ID_CHOICES_FIXTURE))
  t['BackgroundColorHex'].as(() => faker.color.rgb({ format: 'hex', casing: 'upper' }))
  t['Shortcut'].as(() => '')
  t['SvgIcon'].as(() => faker.string.alphanumeric(20))
})
