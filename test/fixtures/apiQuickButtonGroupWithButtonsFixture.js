import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import { apiQuickButtonInGroupFixture } from './apiQuickButtonInGroupFixture.js'
import { ICON_ID_CHOICES_FIXTURE } from './iconIdChoicesFixture.js'

/**
 * Factory fixture for creating test data of type {@link apiQuickButtonGroupWithButtons}.
 *
 * Generates a quick button group with buttons for testing.
 * Creates a group with 2 buttons, each with icons and colors.
 *
 * @returns {apiQuickButtonGroupWithButtons} A group object with nested buttons.
 *          See {@link test/fixtures/TEST_ManyIcons-api-quickButtonCollectionsFull.json} for example structure.
 *
 * @example
 * const group = apiQuickButtonGroupWithButtonsFixture.create();
 * // { Id: 42, ButtonText: 'My Group', Buttons: [...], BackgroundColorHex: '#FF00FF', ... }
 */
export const apiQuickButtonGroupWithButtonsFixture = defineFixture((t) => {
  t['Id'].as(() => faker.number.int({ min: 1, max: 100 }))
  t['CollectionId'].as(() => faker.number.int({ min: 1, max: 100 }))
  t['GroupId'].as(() => faker.string.uuid())
  t['Order'].as(() => faker.number.int({ min: 0, max: 10 }))
  t['ButtonText'].as(() => faker.lorem.words(2))
  t['IconId'].as(() => faker.helpers.arrayElement(ICON_ID_CHOICES_FIXTURE))
  t['BackgroundColorHex'].as(() => faker.color.rgb({ format: 'hex', casing: 'upper' }))
  t['SvgIcon'].as(() => faker.string.alphanumeric(20))
  t['Buttons'].as(() => [
    apiQuickButtonInGroupFixture.create(),
    apiQuickButtonInGroupFixture.create()
  ])
})
