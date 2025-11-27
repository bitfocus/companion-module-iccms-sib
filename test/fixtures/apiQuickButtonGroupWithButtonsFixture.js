import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import { apiQuickButtonInGroupFixture } from './apiQuickButtonInGroupFixture.js'
import { ICON_ID_CHOICES_FIXTURE } from './iconIdChoicesFixture.js'

/**
 * Usage: apiQuickButtonGroupWithButtonsFixture.create()
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
