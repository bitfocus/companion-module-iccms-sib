import { ApiRundownWithoutItemsArray } from '../../../infrastructure/sib-api/ApiRundownWithoutItemsArray.js'

describe('ApiRundownWithoutItemsArray', () => {
  test('empty() returns instance with empty Rundowns array', () => {
    const instance = ApiRundownWithoutItemsArray.empty()
    expect(instance).toBeInstanceOf(ApiRundownWithoutItemsArray)
    expect(Array.isArray(instance.Rundowns)).toBe(true)
    expect(instance.Rundowns.length).toBe(0)
  })
})
