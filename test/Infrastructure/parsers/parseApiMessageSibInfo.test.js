import {parseApiMessageSibInfo} from '../../../infrastructure/parsers/parseApiMessageSibInfo.js'
import {sibInfoWithoutComponentsFixture} from '../../fixtures/sibInfoWithoutComponentsFixture.js'
import {faker} from '@faker-js/faker'
import * as path from 'path'

describe('Sib info deserialization', () => {

  test('Deserialized correctly', () => {
    // arrange
    let expected = {
      SportInTheBoxVersion: '2.8.7257.14899',
      ResponseDate: '2019-11-14T09:15:11',
      DatabasePath: 'E:\\SIB\\MySport.SIB2',
    }

    // act
    const actual = parseApiMessageSibInfo(expected)

    // assert
    expect(actual.SportInTheBoxVersion).toBe(expected.SportInTheBoxVersion)
    expect(actual.ResponseDate).toBe(expected.ResponseDate)
    expect(actual.DatabasePath).toBe(expected.DatabasePath)
  })

  test('Deserialized correctly v2', () => {
    // arrange
    let expected = {
      SportInTheBoxVersion: '2.15.8630.15619',
      ResponseDate: '2023-08-18T11:13:11',
      DatabasePath: 'E:\\ICCMS\\SIB2_DB\\DB_Manual\\DB_manual_qb.SIB2',
      LogOnName: 'DMITRI-LEGION\\dmitr',
    }

    // act
    const actual = parseApiMessageSibInfo(expected)

    // assert
    expect(actual.SportInTheBoxVersion).toBe(expected.SportInTheBoxVersion)
    expect(actual.ResponseDate).toBe(expected.ResponseDate)
    expect(actual.DatabasePath).toBe(expected.DatabasePath)
  })
})
