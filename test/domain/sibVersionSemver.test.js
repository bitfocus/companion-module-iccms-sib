import semver from 'semver'
describe('Sib version check', () => {
	test('Semver works', () => {
		// arrange

		const sibVersion = '2.17.8630'

		// act
		const isLower = semver.lt(sibVersion, '2.16.8630')

		// assert
		expect(isLower).toBeFalsy()
	})
})
