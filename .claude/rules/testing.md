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
