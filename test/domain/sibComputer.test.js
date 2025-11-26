import { SibComputer } from '../../domain/sibComputer.js'

describe('SibComputer', () => {
  let sibComputer

  beforeEach(() => {
    sibComputer = new SibComputer()
  })

  describe('setSibRundowns and getSibRundowns', () => {
    test('should save and return a deep copy of the rundown data', () => {
      const originalRundown = {
        Rundowns: [
          { id: 1, name: 'Rundown 1' },
          { id: 2, name: 'Rundown 2' },
        ],
      }

      sibComputer.setSibRundowns(originalRundown)
      const returnedRundown = sibComputer.getSibRundowns()

      // Ensure the returned rundown is deeply equal to the original
      expect(returnedRundown).toEqual(originalRundown.Rundowns)

      // Ensure the returned rundown is a deep copy
      expect(returnedRundown).not.toBe(originalRundown.Rundowns)
      expect(returnedRundown[0]).not.toBe(originalRundown.Rundowns[0])

      // Modify the original rundown and ensure it does not affect the stored copy
      originalRundown.Rundowns[0].name = 'Modified Rundown 1'
      expect(sibComputer.getSibRundowns()[0].name).toBe('Rundown 1')
    })

    test('should handle undefined or invalid rundown data gracefully', () => {
      sibComputer.setSibRundowns(undefined)
      expect(sibComputer.getSibRundowns()).toEqual([])

      sibComputer.setSibRundowns({ Rundowns: [] })
      expect(sibComputer.getSibRundowns()).toEqual([])
    })
  })
})
