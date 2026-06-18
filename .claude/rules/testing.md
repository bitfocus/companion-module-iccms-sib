---
paths:
  - "test/**/*.js"
---

# Testing Conventions

## File Structure

Mirror the source structure: `src/infrastructure/parsers/foo.js` → `test/Infrastructure/parsers/foo.test.js`

## Imports

Always use `.js` extension in relative paths:

```javascript
import { parseApiMessageSibInfo } from '../../../src/infrastructure/parsers/parseApiMessageSibInfo.js'
import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
```

With `globals: true` in `vitest.config.mjs`, test globals (`describe`, `it`, `test`, `expect`, `vi`, `beforeEach`, `afterEach`) are available without imports. If you need to import them explicitly:

```javascript
import { vi } from 'vitest'
```

## Arrange-Act-Assert

Always structure tests with these comments:

```javascript
test('Deserialized correctly', () => {
	// arrange
	const expected = { field: 'value' }

	// act
	const actual = parseFunction(expected)

	// assert
	expect(actual.field).toBe(expected.field)
})
```

## Mocking

Use `vi.mock()` to replace Node modules. It is auto-hoisted to the top of the file:

```javascript
import * as http from 'http'

vi.mock('http')

it('makes an HTTP call', async () => {
	// arrange
	const mockEmitter = {
		on: vi.fn(function (event, callback) {
			if (event === 'end') callback()
			return this
		}),
	}
	http.get.mockImplementation((_, callback) => {
		callback({ statusCode: 200, on: vi.fn(function (event, listener) {
			if (event === 'end') listener()
			return this
		}) })
		return mockEmitter
	})

	// act & assert
	await expect(myFunction()).resolves.toBeDefined()
})
```

`clearMocks: true` in vitest config clears all mock state before each test automatically. Use `vi.resetAllMocks()` in `afterEach` when you also need to reset mock implementations.

## Faker

Use for variable data only — **never** for values that affect assertion logic (e.g. values with a required format):

```javascript
// Good
const randomPath = faker.system.directoryPath()

// Bad — unpredictable format breaks assertions
const version = faker.string.alphanumeric(10)
```

Common methods: `faker.date.anytime().toISOString()`, `faker.string.uuid()`, `faker.number.int({ min, max })`, `faker.color.rgb({ format: 'hex', casing: 'lower' })`, `faker.system.directoryPath()`.

## Efate Fixtures

Use for complex reusable test data:

```javascript
const sibInfoFixture = defineFixture((t) => {
	t['ResponseDate'].as(() => faker.date.anytime().toISOString())
	t['DatabasePath'].as(() => faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2'))
})

const testData = sibInfoFixture.create() // new random values each call
```

## Edge Cases

Always test: `undefined`, `null`, `{}`, `''`, `[]`, missing optional properties, boundary values.
