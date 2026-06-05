// Unit tests for getChoicesForRundownAction

import { getChoicesForRundownAction } from '../../../application/presetFactory/getChoicesForRundownAction.js'
import { ApiRundownWithoutItemsArray } from '../../../infrastructure/sib-api/ApiRundownWithoutItemsArray.js'
import { ApiRundownWithoutItemsDto } from '../../../infrastructure/sib-api/ApiRundownWithoutItemsDto.js'

describe('getChoicesForRundownAction', () => {
  test('returns default option when input is undefined', () => {
    const result = getChoicesForRundownAction(undefined)
    expect(result).toEqual([{ id: -1, label: 'No rundown' }])
  })

  test('returns default option when Rundowns is empty', () => {
    const rundownsArray = new ApiRundownWithoutItemsArray()
    rundownsArray.replace([])
    const result = getChoicesForRundownAction(rundownsArray)
    expect(result).toEqual([{ id: -1, label: 'No rundown' }])
  })

  test('returns choices for each rundown', () => {
    const rundownsArray = new ApiRundownWithoutItemsArray()
    const r1 = new ApiRundownWithoutItemsDto(1, 0, 'First Rundown', '#ff0000', 'icon1', '')
    const r2 = new ApiRundownWithoutItemsDto(2, 1, 'Second Rundown', '#00ff00', 'icon2', '')
    rundownsArray.replace([r1, r2])
    const result = getChoicesForRundownAction(rundownsArray)
    expect(result).toEqual([
      { id: -1, label: 'No rundown' },
      { id: 1, label: 'First Rundown' },
      { id: 2, label: 'Second Rundown' }
    ])
  })

  test('handles rundown with missing properties gracefully', () => {
    const rundownsArray = new ApiRundownWithoutItemsArray()
    // @ts-ignore
    rundownsArray.replace([{ }])
    const result = getChoicesForRundownAction(rundownsArray)
    // Should push undefined id/label, but not throw
    expect(result.length).toBe(2)
    expect(result[0]).toEqual({ id: -1, label: 'No rundown' })
    expect(result[1]).toHaveProperty('id')
    expect(result[1]).toHaveProperty('label')
  })
})
