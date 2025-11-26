import { SibComputer } from '../../domain/sibComputer.js'
import { ApiRundownWithoutItemsArray } from '../../infrastructure/sib-api/ApiRundownWithoutItemsArray.js'
import { apiRundownWithoutItemsArray2Fixture } from '../fixtures/apiRundownWithoutItemsArray2Fixture.js'

describe('SibComputer', () => {
  let sibComputer

  beforeEach(() => {
    sibComputer = new SibComputer()
  })

  describe('setSibRundowns and getSibRundowns', () => {
    test('should save and return a deep copy of the rundown data (2 rundowns)', () => {
      // Use the fixture to create a reusable ApiRundownWithoutItemsArray-like object
      const fixtureObj = apiRundownWithoutItemsArray2Fixture.create()
      const originalRundown = {
        Rundowns: fixtureObj.Rundowns
      }

      sibComputer.setSibRundowns(originalRundown)
      const returnedRundown = sibComputer.getSibRundowns()

      // Should return an instance of ApiRundownWithoutItemsArray
      expect(returnedRundown).toBeInstanceOf(ApiRundownWithoutItemsArray)
      // Rundowns array should have length 2 and match input
      expect(returnedRundown.Rundowns).toHaveLength(2)
      expect(returnedRundown.Rundowns).toEqual(originalRundown.Rundowns)
      // Deep copy: not the same reference
      expect(returnedRundown.Rundowns).not.toBe(originalRundown.Rundowns)
      expect(returnedRundown.Rundowns[0]).not.toBe(originalRundown.Rundowns[0])
      // Modifying returned rundown does not affect original
      returnedRundown.Rundowns[0].name = 'Changed'
      expect(originalRundown.Rundowns[0].name).not.toBe('Changed')
    })

    test('should handle undefined or invalid rundown data gracefully', () => {
      sibComputer.setSibRundowns(undefined)
      const result1 = sibComputer.getSibRundowns()
      expect(result1).toBeInstanceOf(ApiRundownWithoutItemsArray)
      expect(result1.Rundowns).toEqual([])

      sibComputer.setSibRundowns({ Rundowns: [] })
      const result2 = sibComputer.getSibRundowns()
      expect(result2).toBeInstanceOf(ApiRundownWithoutItemsArray)
      expect(result2.Rundowns).toEqual([])
    })
  })
})
