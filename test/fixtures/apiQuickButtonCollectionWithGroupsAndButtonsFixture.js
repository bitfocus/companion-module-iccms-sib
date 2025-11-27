import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import { apiQuickButtonGroupWithButtonsFixture } from './apiQuickButtonGroupWithButtonsFixture.js'
import { ICON_ID_CHOICES_FIXTURE } from './iconIdChoicesFixture.js'

/**
 * Usage: apiQuickButtonCollectionWithGroupsAndButtonsFixture.create()
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
