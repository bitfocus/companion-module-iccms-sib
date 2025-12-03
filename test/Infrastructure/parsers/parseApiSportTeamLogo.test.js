import {parseApiSportTeamLogo} from '../../../infrastructure/parsers/parseApiSportTeamLogo.js'
import {apiSportTeamLogoFixture} from '../../fixtures/apiSportTeamLogoFixture.js'
import {apiSportTeamLogoMinimalFixture} from '../../fixtures/apiSportTeamLogoMinimalFixture.js'

describe('ApiSportTeamLogo deserialization', () => {

  test('Deserialized correctly with all fields', () => {
    // arrange
    let expected = {
      id: 12345,
      ext: '.PNG',
      logoBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }

    // act
    const actual = parseApiSportTeamLogo(expected)

    // assert
    expect(actual.id).toBe(expected.id)
    expect(actual.ext).toBe(expected.ext)
    expect(actual.logoBase64).toBe(expected.logoBase64)
  })

  test('Deserializes with different file extensions', () => {
    // arrange
    const testCases = [
      { id: 1, ext: '.png', logoBase64: 'base64data1' },
      { id: 2, ext: '.jpg', logoBase64: 'base64data2' },
      { id: 3, ext: '.svg', logoBase64: 'base64data3' }
    ]

    testCases.forEach((expected) => {
      // act
      const actual = parseApiSportTeamLogo(expected)

      // assert
      expect(actual.id).toBe(expected.id)
      expect(actual.ext).toBe(expected.ext.toUpperCase())
      expect(actual.logoBase64).toBe(expected.logoBase64)
    })
  })

  describe('ApiSportTeamLogo deserialization with fixture', () => {
    test('Deserializes complete team logo from fixture', () => {
      // arrange
      const expected = apiSportTeamLogoFixture.create()

      // act
      const actual = parseApiSportTeamLogo(expected)

      // assert
      expect(actual.id).toBe(expected.id)
      expect(actual.ext).toBe(expected.ext)
      expect(actual.logoBase64).toBe(expected.logoBase64)
    })

    test('Deserializes from JSON string input', () => {
      // arrange
      const expected = apiSportTeamLogoFixture.create()
      const json = JSON.stringify(expected)

      // act
      const actual = parseApiSportTeamLogo(json)

      // assert
      expect(actual.id).toBe(expected.id)
      expect(actual.ext).toBe(expected.ext)
      expect(actual.logoBase64).toBe(expected.logoBase64)
    })

    test('Deserializes minimal fields from JSON string input', () => {
      // arrange
      const expected = apiSportTeamLogoMinimalFixture.create()
      const json = JSON.stringify(expected)

      // act
      const actual = parseApiSportTeamLogo(json)

      // assert
      expect(actual.id).toBe(expected.id)
      expect(actual.ext).toBe('')
      expect(actual.logoBase64).toBe('')
    })
  })

  test('Returns null for undefined input', () => {
    // act
    const actual = parseApiSportTeamLogo(undefined)

    // assert
    expect(actual).toBeNull()
  })

  test('Returns null for null input', () => {
    // act
    const actual = parseApiSportTeamLogo(null)

    // assert
    expect(actual).toBeNull()
  })

  test('Returns null for invalid JSON string', () => {
    // act
    const actual = parseApiSportTeamLogo('{invalid json')

    // assert
    expect(actual).toBeNull()
  })

  test('Handles missing fields with defaults', () => {
    // arrange
    let input = {}

    // act
    const actual = parseApiSportTeamLogo(input)

    // assert
    expect(actual.id).toBe(-1)
    expect(actual.ext).toBe('')
    expect(actual.logoBase64).toBe('')
  })
})
