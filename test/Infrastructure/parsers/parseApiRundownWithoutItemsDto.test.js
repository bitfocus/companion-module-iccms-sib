import { parseApiRundownWithoutItemsDto } from '../../../infrastructure/parsers/parseApiRundownWithoutItemsDto.js'
import { apiRundownWithoutItemsDtoFixture } from '../../fixtures/apiRundownWithoutItemsDtoFixture.js'

describe('ApiRundownWithoutItemsDto deserialization', () => {
  test('Deserialized correctly', () => {
    // arrange
    const expected = apiRundownWithoutItemsDtoFixture.create()

    // act
    const actual = parseApiRundownWithoutItemsDto(expected)

    // assert
    expect(actual.Id).toBe(expected.Id)
    expect(actual.Order).toBe(expected.Order)
    expect(actual.RundownName).toBe(expected.Name)
    expect(actual.ColorHex).toBe(expected.ColorHex)
    expect(actual.IconId).toBe(expected.IconId)
    expect(actual.SvgIcon).toBe(expected.SvgIcon)
  })

  test('Returns null for invalid input', () => {
    // arrange
    const invalidInput = null

    // act
    const actual = parseApiRundownWithoutItemsDto(invalidInput)

    // assert
    expect(actual).toBeNull()
  })
})
