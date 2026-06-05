import { getChoicesForTriggerEventAction } from '../../../application/presetFactory/getChoicesForTriggerEventAction.js'
import { apiQuickButtonCollectionWithGroupsAndButtonsFixture } from '../../fixtures/apiQuickButtonCollectionWithGroupsAndButtonsFixture.js'

describe('getChoicesForTriggerEventAction', () => {
  test('has all quickbuttons from collections', () => {
    // arrange
    const collections = [
      apiQuickButtonCollectionWithGroupsAndButtonsFixture.create(),
      apiQuickButtonCollectionWithGroupsAndButtonsFixture.create()
    ]

    // act
    const actual = getChoicesForTriggerEventAction(collections)

    // assert
    // Assert first option is Select QuickButton
    expect(actual[0]).toEqual({ id: -1, label: 'Select QuickButton' })

    // Collect all EventIds from fixture data
    const expectedEventIds = []
    collections.forEach((col) => {
      const groups = Array.isArray(col.Groups) ? col.Groups : []
      groups.forEach((grp) => {
        const buttons = Array.isArray(grp.Buttons) ? grp.Buttons : []
        buttons.forEach((btn) => {
          expectedEventIds.push(btn.EventId ?? 0)
        })
      })
    })

    // Collect all ids from output (skip the first select option and non-number ids)
    const actualIds = actual
      .map((opt) => opt.id)
      .filter((id) => typeof id === 'number')

    // Assert every expected EventId is present in the output
    expectedEventIds.forEach((eventId) => {
      expect(actualIds).toContain(eventId)
    })
  })

})
