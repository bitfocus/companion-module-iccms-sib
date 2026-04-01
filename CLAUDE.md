# companion-module-iccms-sib

Sport In The Box 2 (SIB2) Companion module for Bitfocus Companion / StreamDeck.

## API Version

Uses `@companion-module/base ^1.4.3` (resolves to 1.14.1, API 1.14). Since API 1.13+, variables in `textinput` fields are auto-parsed — manual `parseVariablesInString` calls are no longer needed.

## Project Structure

- **Action IDs**: `application/actionId.js` — all action identifiers as constants
- **Action Definitions**: `application/actions.js` — action definitions, options, callbacks
- **Action Factories**: `application/actionFactory/` — factory pattern (see `createRundownControlAction.js` for constants pattern)
- **Feedback Definitions**: `application/feedbacks.js` — feedback definitions and callbacks
- **Domain**: `domain/` — domain models and icons
- **Infrastructure**: `infrastructure/` — parsers and API communication
- **Tests**: `test/` — mirrors source directory structure

## Build and Test

- **Package Manager**: Yarn (use `yarn test`, NEVER `npm test`)
- **Test Runner**: Jest
- **Module System**: ES Modules
- **Build**: `yarn dist`
- **Dev**: `yarn dev`

## Testing Conventions

See [testing-guide.md](testing-guide.md) for full patterns.

Key rules:

- Mirror source file structure in `test/` directory
- ES module imports with `.js` extension required
- Follow Arrange-Act-Assert pattern with `// arrange`, `// act`, `// assert` comments
- Use [Faker.js](https://fakerjs.dev/api/) for variable data, NOT for logic-dependent values
- Use [Efate](https://www.npmjs.com/package/efate) fixtures for complex reusable test data
- Always test edge cases: `undefined`, `null`, empty objects, empty strings, boundary values
