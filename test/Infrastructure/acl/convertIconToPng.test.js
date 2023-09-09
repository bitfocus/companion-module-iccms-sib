// Old placeholder, from times we used sharp to convert images.
// SVG is not currently supported by companion.

describe('Convert sib svg icon to png', () => {
	test('Decode base64 string', () => {
		// arrange
		// https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/

		const b64string = 'dGEtZGE=' // ta-da
		const buf = Buffer.from(b64string, 'base64')

		// act
		const text = buf.toString('utf-8')

		// assert
		expect(text).toBe('ta-da')
	})
})
