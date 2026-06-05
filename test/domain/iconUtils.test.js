import { getAllUniqueIconIdsFromQbCollectionsAndRundowns } from '../../domain/iconUtils.js'
import { apiRundownWithoutItemsArray2Fixture } from '../fixtures/apiRundownWithoutItemsArray2Fixture.js'
import { apiQuickButtonCollectionWithGroupsAndButtonsFixture } from '../fixtures/apiQuickButtonCollectionWithGroupsAndButtonsFixture.js'
import { ICON_ID_CHOICES_FIXTURE } from '../fixtures/iconIdChoicesFixture.js'
import { apiQuickButtonCollectionsEmptyArrayFixture } from '../fixtures/apiQuickButtonCollectionsEmptyArrayFixture.js'
import { apiRundownWithoutItemsArrayEmptyFixture } from '../fixtures/apiRundownWithoutItemsArrayEmptyFixture.js'

describe('getAllUniqueIconIdsFromQbCollectionsAndRundowns', () => {

  test('extracts icon IDs from qbCollections only', () => {
    // arrange
    const qbCollections = [apiQuickButtonCollectionWithGroupsAndButtonsFixture.create()]
    // deterministic override for collection, groups, and buttons
    qbCollections[0].IconId = ICON_ID_CHOICES_FIXTURE[0]
    const groupIcon = ICON_ID_CHOICES_FIXTURE[1]
    const buttonIcon = ICON_ID_CHOICES_FIXTURE[2]
    if (qbCollections[0].Groups) {
      qbCollections[0].Groups.forEach((group) => {
        group.IconId = groupIcon
        if (group.Buttons) {
          group.Buttons.forEach((button) => {
            button.IconId = buttonIcon
          })
        }
      })
    }
    const allRundowns = apiRundownWithoutItemsArrayEmptyFixture.create()

    // act
    const result = getAllUniqueIconIdsFromQbCollectionsAndRundowns(qbCollections, allRundowns)

    // assert
    expect(result).toBeInstanceOf(Set)
    expect(result.has(ICON_ID_CHOICES_FIXTURE[0])).toBe(true)
    expect(result.has(ICON_ID_CHOICES_FIXTURE[1])).toBe(true)
    expect(result.has(ICON_ID_CHOICES_FIXTURE[2])).toBe(true)
    expect(result.size).toBeGreaterThanOrEqual(3)
  })

  test('extracts icon IDs from rundowns only', () => {
    // arrange
    const qbCollections = apiQuickButtonCollectionsEmptyArrayFixture.create()
    const allRundowns = apiRundownWithoutItemsArray2Fixture.create()
    // deterministic override for all rundowns
    if (allRundowns.Rundowns) {
      allRundowns.Rundowns.forEach(rundown => {
        rundown.IconId = ICON_ID_CHOICES_FIXTURE[4]
      })
    }

    // act
    const result = getAllUniqueIconIdsFromQbCollectionsAndRundowns(qbCollections, allRundowns)

    // assert
    expect(result).toBeInstanceOf(Set)
    expect(Array.from(result)).toEqual([ICON_ID_CHOICES_FIXTURE[4]])
  })

  test('extracts icon IDs from collections and rundowns', () => {
    // arrange
    const qbCollections = [apiQuickButtonCollectionWithGroupsAndButtonsFixture.create()]
    qbCollections[0].IconId = ICON_ID_CHOICES_FIXTURE[0]
    const groupIcon = ICON_ID_CHOICES_FIXTURE[1]
    const buttonIcon = ICON_ID_CHOICES_FIXTURE[2]
    if (qbCollections[0].Groups) {
      qbCollections[0].Groups.forEach((group) => {
        group.IconId = groupIcon
        if (group.Buttons) {
          group.Buttons.forEach((button) => {
            button.IconId = buttonIcon
          })
        }
      })
    }
    const allRundowns = apiRundownWithoutItemsArray2Fixture.create()
    // deterministic override for all rundowns
    if (allRundowns.Rundowns) {
      allRundowns.Rundowns.forEach(rundown => {
        rundown.IconId = ICON_ID_CHOICES_FIXTURE[4]
      })
    }

    // act
    const result = getAllUniqueIconIdsFromQbCollectionsAndRundowns(qbCollections, allRundowns)

    // assert
    expect(result).toBeInstanceOf(Set)
    expect(result.has(ICON_ID_CHOICES_FIXTURE[0])).toBe(true)
    expect(result.has(ICON_ID_CHOICES_FIXTURE[1])).toBe(true)
    expect(result.has(ICON_ID_CHOICES_FIXTURE[2])).toBe(true)
    expect(result.has(ICON_ID_CHOICES_FIXTURE[4])).toBe(true)
    expect(result.size).toBeGreaterThanOrEqual(4)
  })

  test('handles empty inputs', () => {
    // arrange/act/assert
    expect(
      getAllUniqueIconIdsFromQbCollectionsAndRundowns(
        apiQuickButtonCollectionsEmptyArrayFixture.create(),
        apiRundownWithoutItemsArrayEmptyFixture.create()
      )
    ).toEqual(new Set())
    expect(getAllUniqueIconIdsFromQbCollectionsAndRundowns(undefined, undefined)).toEqual(new Set())
  })
})
