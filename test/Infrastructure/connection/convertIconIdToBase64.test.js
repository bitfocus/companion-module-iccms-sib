import { convertIconIdToBase64 } from '../../../infrastructure/connection/sibHttpClient.js'

describe('Convert sib icon id to base64 string', () => {
	it.each([
		['action', 'YWN0aW9u'],
		['flat/flat_web_design/our_team2', 'ZmxhdC9mbGF0X3dlYl9kZXNpZ24vb3VyX3RlYW0y'],
	])('Icon id: %s, converted to  %s', (iconId, expectedBase) => {
		const actualBase64 = convertIconIdToBase64(iconId)

		expect(actualBase64).toBe(expectedBase)
	})
})
