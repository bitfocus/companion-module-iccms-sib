import {defineFixture} from 'efate'
import {faker} from '@faker-js/faker'
import * as path from 'path'

/**
 * Factory fixture for creating test data of type {@link ApiMessageSibInfo} (without components).
 *
 * @returns {ApiMessageSibInfo} An object with SIB info properties.
 *          See {@link ../infrastructure/sib-api/apiMessageSibInfo.js} for structure.
 *
 * @example
 * const sibInfo = sibInfoWithoutComponentsFixture.create();
 * // { SportInTheBoxVersion: '2.8.7257.14899', ResponseDate: '2019-11-14T09:15:11', DatabasePath: 'E:\\SIB\\MySport.SIB2' }
 */
export const sibInfoWithoutComponentsFixture = defineFixture((t) => {
  t['SportInTheBoxVersion'].as(() => faker.system.semver())
  t['ResponseDate'].as(() => faker.date.anytime().toISOString())
  t['DatabasePath'].as(() => faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2'))
})
