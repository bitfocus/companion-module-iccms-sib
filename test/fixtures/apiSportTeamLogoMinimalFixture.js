import { defineFixture } from 'efate'

/**
 * Factory fixture for creating minimal test data of a type {@link ApiSportTeamLogo}.
 * This fixture creates team logo objects with minimal or empty data.
 *
 * @returns {ApiSportTeamLogo} An object with minimal team logo properties.
 *          See {@link ../../infrastructure/sib-api/apiSportTeamLogo.js} for structure.
 *
 * @example
 * const teamLogo = apiSportTeamLogoMinimalFixture.create();
 * // {
 * // id: 0,
 * // ext: '',
 * // logoBase64: ''
 * // }
 */
export const apiSportTeamLogoMinimalFixture = defineFixture((t) => {
  t['id'].as(() => 0)
  t['ext'].as(() => '')
  t['logoBase64'].as(() => '')
})
