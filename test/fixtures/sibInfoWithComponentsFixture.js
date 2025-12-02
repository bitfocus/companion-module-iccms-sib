import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import * as path from 'path'

/**
 * Factory fixture for creating test data of type {@link ApiMessageSibInfo} (with components).
 *
 * @returns {ApiMessageSibInfo} An object with SIB info properties.
 *          See {@link ../infrastructure/sib-api/apiMessageSibInfo.js} for structure.
 *
 * @example
 * const sibInfo = sibInfoWithComponentsFixture.create();
 * // {
 * //   SportInTheBoxVersion: '2.20.9467.22421',
 * //   ResponseDate: '2025-12-02T12:34:58',
 * //   DatabasePath: 'M:\\TEST_DB\\TEST_ManyIcons.SIB2',
 * //   LogOnName: 'DMITRI-LEGION\\dmitr',
 * //   ComponentLastModified: {
 * //     QuickButton: '2025-12-02T11:34:51.6038616Z',
 * //     Rundown: '2025-12-02T11:34:52.9350453Z',
 * //     Team: '2025-12-02T12:34:41.5824480Z'
 * //   }
 * // }
 */
export const sibInfoWithComponentsFixture = defineFixture((t) => {
  t['SportInTheBoxVersion'].as(() => faker.system.semver())
  t['ResponseDate'].as(() => faker.date.anytime().toISOString())
  t['DatabasePath'].as(() => faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2'))
  t['LogOnName'].as(() => faker.system.fileName() + '\\' + faker.person.firstName().toLowerCase())
  t['ComponentLastModified'].as(() => ({
    QuickButton: faker.date.anytime().toISOString(),
    Rundown: faker.date.anytime().toISOString(),
    Team: faker.date.anytime().toISOString()
  }))
})
