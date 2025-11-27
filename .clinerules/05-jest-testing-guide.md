# Jest and Faker Testing Guide

## Documentation References

### When Uncertain About Testing

- **Primary Jest Reference**: <https://jestjs.io/docs/getting-started>
- **Faker.js API**: <https://fakerjs.dev/api/>
- **Efate Fixtures**: <https://www.npmjs.com/package/efate>
- **Testing Best Practices**: <https://github.com/goldbergyoni/javascript-testing-best-practices>

### Project Configuration

- **Package Manager**: Yarn (use `yarn test`, not `npm test`)
- **Test Runner**: Jest
- **Module System**: ES Modules
- **Versions**: See [package.json](../package.json)

### For Specific Topics

- **Jest Matchers**: <https://jestjs.io/docs/using-matchers>
- **Jest Expect API**: <https://jestjs.io/docs/expect>
- **Jest Setup/Teardown**: <https://jestjs.io/docs/setup-teardown>
- **Jest CLI Options**: <https://jestjs.io/docs/cli>
- **Faker Date**: <https://fakerjs.dev/api/date>
- **Faker System**: <https://fakerjs.dev/api/system>
- **Faker String**: <https://fakerjs.dev/api/string>
- **Faker Number**: <https://fakerjs.dev/api/number>
- **Faker Color**: <https://fakerjs.dev/api/color>
- **Efate-Faker Plugin**: <https://www.npmjs.com/package/efate-faker>

### Troubleshooting

- **Test not found** → Check file naming: `*.test.js` in `test/` directory
- **Import errors** → Verify ES module syntax and path (use `.js` extension)
- **Faker data inconsistent** → Use `faker.seed()` for reproducible tests
- **Fixture not working** → Check `defineFixture()` syntax and `.as()` / `.asDate()` usage
- **Assertion fails** → Review Jest matchers: <https://jestjs.io/docs/expect>

---

## Rule 1: Test File Organization

### Directory Structure

**ALWAYS** mirror the source file structure in the `test/` directory:

```plaintext
Project Root
├── infrastructure/
│   └── parsers/
│       └── parseApiMessageSibInfo.js
└── test/
    └── Infrastructure/              # Note: Capital 'I'
        └── parsers/
            └── parseApiMessageSibInfo.test.js
```

### File Naming Convention

- Test files: `[filename].test.js`
- Use exact source filename + `.test.js` suffix
- Maintain directory structure hierarchy

### Import Patterns

Use ES module syntax with relative paths:

```javascript
// ✅ GOOD - ES modules with .js extension
import { parseApiMessageSibInfo } from '../../../infrastructure/parsers/parseApiMessageSibInfo.js'
import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'

// ❌ BAD - Missing .js extension
import { parseApiMessageSibInfo } from '../../../infrastructure/parsers/parseApiMessageSibInfo'

// ❌ BAD - CommonJS syntax
const { parseApiMessageSibInfo } = require('../../../infrastructure/parsers/parseApiMessageSibInfo.js')
```

---

## Rule 2: Test Structure Standards

### Use describe() and test() Blocks

```javascript
describe('Feature or Component Name', () => {
    // Optional: Setup fixtures or shared data
    const userFixture = defineFixture((t) => {
        // Fixture configuration
    })

    test('Specific behavior description', () => {
        // Test implementation
    })

    test('Another specific behavior', () => {
        // Test implementation
    })
})
```

### Arrange-Act-Assert Pattern

**ALWAYS** structure tests with clear sections:

```javascript
test('Deserialized correctly', () => {
    // arrange - Set up test data
    let expected = {
        SportInTheBoxVersion: '2.8.7257.14899',
        ResponseDate: '2019-11-14T09:15:11',
        DatabasePath: 'E:\\SIB\\MySport.SIB2',
    }

    // act - Execute the function under test
    const actual = parseApiMessageSibInfo(expected)

    // assert - Verify the results
    expect(actual.SportInTheBoxVersion).toBe(expected.SportInTheBoxVersion)
    expect(actual.ResponseDate).toBe(expected.ResponseDate)
    expect(actual.DatabasePath).toBe(expected.DatabasePath)
})
```

### Descriptive Test Names

Use clear, behavior-focused descriptions:

```javascript
// ✅ GOOD - Describes behavior
test('Deserialized correctly')
test('Returns null when input is undefined')
test('Parses date string to ISO format')
test('Handles missing optional fields')

// ❌ BAD - Vague or technical
test('test1')
test('Works')
test('Parser test')
```

---

## Rule 3: Faker Usage Patterns

### When to Use Faker

Use Faker to generate **random but realistic** test data:

- ✅ Property values that don't affect test logic
- ✅ Large datasets with varied inputs
- ✅ Testing data validation and edge cases
- ✅ Generating multiple test scenarios

### Common Faker Methods for This Project

```javascript
import { faker } from '@faker-js/faker'

// Dates
faker.date.anytime()                           // Random date
faker.date.anytime().toISOString()             // ISO string format
faker.date.past()                              // Past date
faker.date.future()                            // Future date

// File paths (Windows-compatible)
faker.system.directoryPath()                   // 'C:\Users\Documents'
faker.system.commonFileName('SIB2')            // 'file.SIB2'
faker.system.filePath()                        // Full file path

// Use path.sep for cross-platform paths
import * as path from 'path'
faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2')
// Result: 'E:\SIB\MySport.SIB2'

// Strings
faker.string.alphanumeric(10)                  // Random string
faker.string.uuid()                            // UUID
faker.lorem.word()                             // Random word

// Numbers
faker.number.int({ min: 1, max: 100 })        // Integer in range
faker.number.float({ min: 0, max: 1 })        // Float in range

// Colors
faker.color.rgb({ format: 'hex', casing: 'lower' })  // '#ff0000'
faker.color.rgb()                              // 'rgb(255, 0, 0)'

// Names and text
faker.person.fullName()                        // 'John Doe'
faker.internet.email()                         // 'test@example.com'
```

### Faker Best Practices

```javascript
// ✅ GOOD - Use faker for variable data
test('Handles various file paths', () => {
    const randomPath = faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2')
    const input = { DatabasePath: randomPath }
    const result = parseFunction(input)
    expect(result.DatabasePath).toBe(randomPath)
})

// ❌ BAD - Don't use faker for data that affects assertions
test('Version number parsing', () => {
    const version = faker.string.alphanumeric(10)  // Unpredictable format!
    const input = { version: version }
    const result = parseVersion(input)
    expect(result.major).toBe(2)  // This will likely fail
})

// ✅ GOOD - Use specific values for logic-dependent data
test('Version number parsing', () => {
    const version = '2.8.7257.14899'  // Predictable format
    const input = { version: version }
    const result = parseVersion(input)
    expect(result.major).toBe(2)
})
```

---

## Rule 4: Efate Fixture Patterns

### defineFixture() Basics

Use `defineFixture()` to create reusable test data templates:

```javascript
import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'

const userFixture = defineFixture((t) => {
    // Define field transformations
    t['SportInTheBoxVersion'].asDate()
    t['ResponseDate'].as(() => faker.date.anytime().toISOString())
    t['DatabasePath'].as(() => faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2'))
})
```

### Creating Fixture Instances

```javascript
test('Example using fixtures', () => {
    // Create instance with random data
    const testData1 = userFixture.create()
    const testData2 = userFixture.create()
    
    // testData1 and testData2 have different random values
    expect(testData1.ResponseDate).not.toBe(testData2.ResponseDate)
})
```

### Fixture Customization Methods

```javascript
const fixture = defineFixture((t) => {
    // .as() - Custom generator function
    t['ResponseDate'].as(() => faker.date.anytime().toISOString())
    
    // .asDate() - Converts to Date object
    t['SportInTheBoxVersion'].asDate()
    
    // .asUUID() - Generates UUID (requires efate-uuid plugin)
    // t['id'].asUUID()
})
```

### When to Use Fixtures vs. Faker Directly

```javascript
// ✅ Use fixtures for complex objects with multiple fields
const sibInfoFixture = defineFixture((t) => {
    t['SportInTheBoxVersion'].as(() => faker.string.alphanumeric(10))
    t['ResponseDate'].as(() => faker.date.anytime().toISOString())
    t['DatabasePath'].as(() => faker.system.directoryPath() + path.sep + faker.system.commonFileName('SIB2'))
})

// ✅ Use faker directly for simple single values
test('Simple value generation', () => {
    const randomName = faker.person.fullName()
    expect(randomName).toBeTruthy()
})
```

---

## Rule 5: Jest Matchers and Assertions

### Common Matchers

```javascript
// Equality
expect(actual).toBe(expected)                  // Strict equality (===)
expect(actual).toEqual(expected)               // Deep equality for objects
expect(actual).not.toBe(expected)              // Negation

// Truthiness
expect(value).toBeTruthy()                     // Not false, 0, '', null, undefined, NaN
expect(value).toBeFalsy()                      // false, 0, '', null, undefined, NaN
expect(value).toBeNull()                       // null
expect(value).toBeUndefined()                  // undefined
expect(value).toBeDefined()                    // Not undefined

// Numbers
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3)
expect(value).toBeLessThan(5)
expect(value).toBeLessThanOrEqual(5)
expect(value).toBeCloseTo(0.3, 5)              // Floating point comparison

// Strings
expect(string).toMatch(/pattern/)              // Regex match
expect(string).toContain('substring')

// Arrays and Iterables
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(array).toContainEqual(object)           // Contains object with deep equality

// Objects
expect(object).toHaveProperty('key')
expect(object).toHaveProperty('key', value)
expect(object).toMatchObject({ key: value })   // Partial match

// Exceptions
expect(() => fn()).toThrow()
expect(() => fn()).toThrow(Error)
expect(() => fn()).toThrow('error message')
```

### Reference

Full matcher list: <https://jestjs.io/docs/expect>

---

## Rule 6: Testing Edge Cases

### Always Test Edge Cases

```javascript
describe('Parser function', () => {
    test('Handles valid input', () => {
        const input = { field: 'value' }
        const result = parseFunction(input)
        expect(result.field).toBe('value')
    })

    test('Returns null when input is undefined', () => {
        const result = parseFunction(undefined)
        expect(result).toBeNull()
    })

    test('Returns null when input is null', () => {
        const result = parseFunction(null)
        expect(result).toBeNull()
    })

    test('Handles missing optional fields', () => {
        const input = { requiredField: 'value' }
        const result = parseFunction(input)
        expect(result.optionalField).toBe('')
    })

    test('Handles empty strings', () => {
        const input = { field: '' }
        const result = parseFunction(input)
        expect(result.field).toBe('')
    })
})
```

### Edge Cases Checklist

- [ ] `undefined` input
- [ ] `null` input
- [ ] Empty object `{}`
- [ ] Empty string `''`
- [ ] Empty array `[]`
- [ ] Missing optional properties
- [ ] Extra unexpected properties
- [ ] Invalid data types
- [ ] Boundary values (min/max)

---

## Rule 7: Multiple Test Cases Pattern

### Create Multiple Scenarios

Use multiple test cases to verify different input variations:

```javascript
describe('Sib info deserialization', () => {
    test('Deserialized correctly', () => {
        let expected = {
            SportInTheBoxVersion: '2.8.7257.14899',
            ResponseDate: '2019-11-14T09:15:11',
            DatabasePath: 'E:\\SIB\\MySport.SIB2',
        }

        const actual = parseApiMessageSibInfo(expected)

        expect(actual.SportInTheBoxVersion).toBe(expected.SportInTheBoxVersion)
        expect(actual.ResponseDate).toBe(expected.ResponseDate)
        expect(actual.DatabasePath).toBe(expected.DatabasePath)
    })

    test('Deserialized correctly v2', () => {
        let expected = {
            SportInTheBoxVersion: '2.15.8630.15619',
            ResponseDate: '2023-08-18T11:13:11',
            DatabasePath: 'E:\\ICCMS\\SIB2_DB\\DB_Manual\\DB_manual_qb.SIB2',
            LogOnName: 'DMITRI-LEGION\\dmitr',
        }

        const actual = parseApiMessageSibInfo(expected)

        expect(actual.SportInTheBoxVersion).toBe(expected.SportInTheBoxVersion)
        expect(actual.ResponseDate).toBe(expected.ResponseDate)
        expect(actual.DatabasePath).toBe(expected.DatabasePath)
    })
})
```

### When to Use Multiple Tests vs. Parameterized Tests

```javascript
// ✅ GOOD - Distinct scenarios with different assertions
test('Scenario 1: Basic fields only', () => { ... })
test('Scenario 2: With optional LogOnName field', () => { ... })

// ✅ ALSO GOOD - Parameterized tests for same assertions
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

Reference: <https://jestjs.io/docs/api#testeachtablename-fn-timeout>

---

## Rule 8: Test Isolation

### Each Test Should Be Independent

```javascript
// ✅ GOOD - Tests don't share state
describe('Parser tests', () => {
    test('Test 1', () => {
        const input1 = { field: 'value1' }
        const result1 = parseFunction(input1)
        expect(result1.field).toBe('value1')
    })

    test('Test 2', () => {
        const input2 = { field: 'value2' }
        const result2 = parseFunction(input2)
        expect(result2.field).toBe('value2')
    })
})

// ❌ BAD - Tests share mutable state
describe('Parser tests', () => {
    let sharedInput = { field: 'value1' }  // Shared state!

    test('Test 1', () => {
        sharedInput.field = 'modified'  // Mutates shared state
        const result = parseFunction(sharedInput)
        expect(result.field).toBe('modified')
    })

    test('Test 2', () => {
        // This test now depends on Test 1's execution order!
        const result = parseFunction(sharedInput)
        expect(result.field).toBe('value1')  // May fail!
    })
})
```

### Use beforeEach() for Shared Setup

```javascript
describe('Parser tests with setup', () => {
    let testInput

    beforeEach(() => {
        // Runs before EACH test
        testInput = {
            SportInTheBoxVersion: '2.8.7257.14899',
            ResponseDate: '2019-11-14T09:15:11',
            DatabasePath: 'E:\\SIB\\MySport.SIB2',
        }
    })

    test('Test 1', () => {
        const result = parseApiMessageSibInfo(testInput)
        expect(result.SportInTheBoxVersion).toBe('2.8.7257.14899')
    })

    test('Test 2', () => {
        // Fresh testInput from beforeEach()
        testInput.ResponseDate = '2023-08-18T11:13:11'
        const result = parseApiMessageSibInfo(testInput)
        expect(result.ResponseDate).toBe('2023-08-18T11:13:11')
    })
})
```

Reference: <https://jestjs.io/docs/setup-teardown>

---

## Rule 9: Running Tests

**IMPORTANT**: This project uses **Yarn**, not npm. Always use `yarn test`, never `npm test`.

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Run in watch mode (development)
yarn test --watch

# Run specific file
yarn test filename.test.js
```

**Reference**: For Jest CLI options, see [Jest CLI Documentation](https://jestjs.io/docs/cli)

### What to Test

**ALWAYS test:**

- ✅ Main execution paths
- ✅ Edge cases (null, undefined, empty)
- ✅ Error conditions
- ✅ Boundary values
- ✅ Different input variations

**DON'T test:**

- ❌ Third-party library internals
- ❌ Framework code
- ❌ Trivial getters/setters without logic
- ❌ Auto-generated code

---

## Rule 10: Test Organization Best Practices

### Group Related Tests

```javascript
describe('parseApiMessageSibInfo', () => {
    describe('Valid inputs', () => {
        test('Basic SIB info with required fields', () => { ... })
        test('SIB info with optional LogOnName field', () => { ... })
    })

    describe('Invalid inputs', () => {
        test('Returns null for undefined input', () => { ... })
        test('Returns null for null input', () => { ... })
    })

    describe('Edge cases', () => {
        test('Handles missing optional fields', () => { ... })
        test('Handles empty strings', () => { ... })
    })
})
```

### Use Clear Variable Names

```javascript
// ✅ GOOD - Descriptive names
test('Parses database path correctly', () => {
    const expectedDatabasePath = 'E:\\SIB\\MySport.SIB2'
    const inputData = { DatabasePath: expectedDatabasePath }
    const parsedResult = parseApiMessageSibInfo(inputData)
    expect(parsedResult.DatabasePath).toBe(expectedDatabasePath)
})

// ❌ BAD - Unclear names
test('Test', () => {
    const x = 'E:\\SIB\\MySport.SIB2'
    const y = { DatabasePath: x }
    const z = parseApiMessageSibInfo(y)
    expect(z.DatabasePath).toBe(x)
})
```

---

## Quick Reference: Test Template

```javascript
import { functionToTest } from '../../../path/to/module.js'
import { defineFixture } from 'efate'
import { faker } from '@faker-js/faker'
import * as path from 'path'

describe('Feature or Component Name', () => {
    // Optional: Define fixtures
    const testFixture = defineFixture((t) => {
        t['field1'].as(() => faker.date.anytime().toISOString())
        t['field2'].as(() => faker.system.directoryPath() + path.sep + faker.system.commonFileName('ext'))
    })

    // Optional: Setup/Teardown
    beforeEach(() => {
        // Runs before each test
    })

    afterEach(() => {
        // Runs after each test
    })

    test('Descriptive test name for main scenario', () => {
        // arrange
        const expected = {
            field1: 'value1',
            field2: 'value2',
        }

        // act
        const actual = functionToTest(expected)

        // assert
        expect(actual.field1).toBe(expected.field1)
        expect(actual.field2).toBe(expected.field2)
    })

    test('Handles edge case: undefined input', () => {
        // act
        const result = functionToTest(undefined)

        // assert
        expect(result).toBeNull()
    })

    test('Uses faker for random data', () => {
        // arrange
        const randomValue = faker.date.anytime().toISOString()
        const input = { field1: randomValue }

        // act
        const result = functionToTest(input)

        // assert
        expect(result.field1).toBe(randomValue)
    })

    test('Uses fixture for complex data', () => {
        // arrange
        const testData = testFixture.create()

        // act
        const result = functionToTest(testData)

        // assert
        expect(result).toBeDefined()
        expect(result.field1).toBe(testData.field1)
    })
})
```

---

## Self-Checking Guidelines

### Before Writing Tests

1. ✅ Check test file location matches source structure
2. ✅ Import function with `.js` extension in path
3. ✅ Identify edge cases to test
4. ✅ Determine if fixtures are needed for complex data
5. ✅ Plan test scenarios (happy path + edge cases)

### After Writing Tests

1. ✅ Verify tests run successfully: `yarn test`
2. ✅ Check tests are isolated (no shared mutable state)
3. ✅ Confirm descriptive test names
4. ✅ Validate Arrange-Act-Assert pattern used
5. ✅ Ensure faker used appropriately (not for logic-dependent data)
6. ✅ Run coverage report: `yarn test --coverage`

### Common Issues Checklist

- [ ] Import error? → Check `.js` extension in import path
- [ ] Test not found? → Verify `*.test.js` naming and location
- [ ] Faker values fail assertions? → Use specific values for logic tests
- [ ] Tests affect each other? → Check for shared mutable state
- [ ] Unclear test failure? → Improve test names and assertions

---

## Summary: Key Principles

1. **Package Manager**: Use **Yarn**, not npm - always `yarn test`
2. **Structure**: Mirror source directory structure in `test/`
3. **Naming**: Use `[filename].test.js` convention
4. **Imports**: ES modules with `.js` extension
5. **Organization**: Use `describe()` and `test()` with clear names
6. **Pattern**: Follow Arrange-Act-Assert
7. **Faker**: Use for variable data, not logic-dependent values
8. **Fixtures**: Use efate for complex reusable data templates
9. **Isolation**: Each test should be independent
10. **Edge Cases**: Always test null, undefined, empty values
11. **Matchers**: Use appropriate Jest matchers for assertions

---

## When in Doubt

1. **Read official docs**:
   - Jest: <https://jestjs.io/docs/getting-started>
   - Faker: <https://fakerjs.dev/guide/>
   - Efate: <https://www.npmjs.com/package/efate>

2. **Check existing tests** - Look at similar test files in your project

3. **Follow the template** - Use the Quick Reference template

4. **Test edge cases** - Always include null/undefined tests

5. **Keep tests isolated** - No shared mutable state between tests

6. **Ask for clarification** - If requirements are ambiguous
