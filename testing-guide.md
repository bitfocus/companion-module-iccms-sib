# Testing Guide

## Test File Organization

**ALWAYS** mirror the source file structure in the `test/` directory:

```plaintext
Project Root
+-- infrastructure/
|   +-- parsers/
|       +-- parseApiMessageSibInfo.js
+-- test/
    +-- Infrastructure/
        +-- parsers/
            +-- parseApiMessageSibInfo.test.js
```

### Import Patterns

Use ES module syntax with relative paths:

```javascript
// GOOD - ES modules with .js extension
import { parseApiMessageSibInfo } from '../../../infrastructure/parsers/parseApiMessageSibInfo.js'
import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'

// BAD - Missing .js extension
import { parseApiMessageSibInfo } from '../../../infrastructure/parsers/parseApiMessageSibInfo'
```

---

## Arrange-Act-Assert Pattern

**ALWAYS** structure tests with clear comments:

```javascript
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
```

### Descriptive Test Names

```javascript
// GOOD
test('Deserialized correctly')
test('Returns null when input is undefined')
test('Parses date string to ISO format')

// BAD
test('test1')
test('Works')
```

---

## Faker Usage Patterns

### Common Faker Methods

```javascript
import { faker } from '@faker-js/faker'

faker.date.anytime().toISOString()
faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2')
faker.string.alphanumeric(10)
faker.string.uuid()
faker.number.int({ min: 1, max: 100 })
```

### Faker Best Practices

```javascript
// GOOD - Use faker for variable data
test('Handles various file paths', () => {
    const randomPath = faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2')
    const input = { DatabasePath: randomPath }
    const result = parseFunction(input)
    expect(result.DatabasePath).toBe(randomPath)
})

// BAD - Don't use faker for data that affects assertions
test('Version number parsing', () => {
    const version = faker.string.alphanumeric(10)  // Unpredictable format!
    // ...
})
```

---

## Efate Fixture Patterns

```javascript
import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'

const sibInfoFixture = defineFixture((t) => {
    t['SportInTheBoxVersion'].asDate()
    t['ResponseDate'].as(() => faker.date.anytime().toISOString())
    t['DatabasePath'].as(() => faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2'))
})

test('Example using fixtures', () => {
    const testData1 = sibInfoFixture.create()
    const testData2 = sibInfoFixture.create()
    // testData1 and testData2 have different random values
})
```

---

## Jest Matchers Quick Reference

```javascript
expect(actual).toBe(expected)              // Strict equality
expect(actual).toEqual(expected)           // Deep equality
expect(value).toBeTruthy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()
expect(value).toBeGreaterThan(3)
expect(string).toMatch(/pattern/)
expect(string).toContain('substring')
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(object).toHaveProperty('key')
expect(object).toMatchObject({ key: value })
expect(() => fn()).toThrow()
```

---

## Edge Cases Checklist

Always test:
- `undefined` input
- `null` input
- Empty object `{}`
- Empty string `''`
- Empty array `[]`
- Missing optional properties
- Invalid data types
- Boundary values (min/max)

---

## Parameterized Tests

```javascript
test.each([
    ['2.8.7257.14899', '2019-11-14T09:15:11'],
    ['2.15.8630.15619', '2023-08-18T11:13:11'],
])('Parses version %s and date %s', (version, date) => {
    const input = { SportInTheBoxVersion: version, ResponseDate: date }
    const result = parseApiMessageSibInfo(input)
    expect(result.SportInTheBoxVersion).toBe(version)
    expect(result.ResponseDate).toBe(date)
})
```

---

## Test Isolation

```javascript
// GOOD - Tests don't share state
describe('Parser tests', () => {
    test('Test 1', () => {
        const input1 = { field: 'value1' }
        const result1 = parseFunction(input1)
        expect(result1.field).toBe('value1')
    })
})

// Use beforeEach() for shared setup
describe('Parser tests with setup', () => {
    let testInput
    beforeEach(() => {
        testInput = {
            SportInTheBoxVersion: '2.8.7257.14899',
            ResponseDate: '2019-11-14T09:15:11',
        }
    })
})
```

---

## Running Tests

```bash
yarn test                        # Run all tests
yarn test --coverage             # Run with coverage
yarn test --watch                # Run in watch mode
yarn test filename.test.js       # Run specific file
```

---

## Test Organization

```javascript
describe('parseApiMessageSibInfo', () => {
    describe('Valid inputs', () => {
        test('Basic SIB info with required fields', () => { ... })
    })
    describe('Invalid inputs', () => {
        test('Returns null for undefined input', () => { ... })
    })
    describe('Edge cases', () => {
        test('Handles missing optional fields', () => { ... })
    })
})
```

---

## Documentation References

- [Jest](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Jest CLI](https://jestjs.io/docs/cli)
- [Faker.js](https://fakerjs.dev/api/)
- [Efate Fixtures](https://www.npmjs.com/package/efate)

## Troubleshooting

- **Test not found** -> Check file naming: `*.test.js` in `test/` directory
- **Import errors** -> Verify ES module syntax and path (use `.js` extension)
- **Faker data inconsistent** -> Use `faker.seed()` for reproducible tests
- **Fixture not working** -> Check `defineFixture()` syntax and `.as()` / `.asDate()` usage
