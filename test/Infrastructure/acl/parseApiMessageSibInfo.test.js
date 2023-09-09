import { parseApiMessageSibInfo } from '../../../infrastructure/acl/parseApiMessageSibInfo.js'
import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import * as path from 'path'
import { ApiMessageSibInfo } from '../../../infrastructure/protocol/apiMessageSibInfo.js'

describe('Sib info deserialization', () => {
	const userFixture = defineFixture((t) => {
		t['SportInTheBoxVersion'].asDate()
		t['ResponseDate'].as(() => faker.date.anytime().toISOString())
		t['DatabasePath'].as(() => faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2'))
	})

	test('Deserialized correctly', () => {
		const test1 = userFixture.create()
		const test2 = userFixture.create()

		const randomName = faker.date.anytime()
		// faker.color.rgb({ format: 'hex', casing: 'lower' })

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
		// export default class apiQuickButtonInGroup {
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
