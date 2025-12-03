import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'

/**
 * Factory fixture for creating test data of a type {@link ApiSportTeamLogo}.
 *
 * @returns {ApiSportTeamLogo} An object with team logo properties.
 *          See {@link ../../infrastructure/sib-api/apiSportTeamLogo.js} for structure.
 *
 * @example
 * const teamLogo = apiSportTeamLogoFixture.create();
 * // {
 * // id: 12345,
 * // ext: '.PNG',
 * // logoBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
 * // }
 */
export const apiSportTeamLogoFixture = defineFixture((t) => {
  t['id'].as(() => faker.number.int({ min: 1, max: 999999 }))
  t['ext'].as(() => faker.helpers.arrayElement(['.PNG', '.JPG', '.SVG']))
  t['logoBase64'].as(() => faker.image.dataUri({ width: 100, height: 100 }).split(',')[1])
})
