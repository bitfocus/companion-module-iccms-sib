import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import { ICON_ID_CHOICES_FIXTURE } from './iconIdChoicesFixture.js'

/**
 * Usage: apiQuickButtonInGroupFixture.create()
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
