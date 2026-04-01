# companion-module-iccms-sib

Sport In The Box 2 (SIB2) Companion module for Bitfocus Companion / StreamDeck.

## API Version

Uses `@companion-module/base ^1.4.3` (resolves to 1.14.1, API 1.14). Since API 1.13+, variables in `textinput` fields are auto-parsed — manual `parseVariablesInString` calls are no longer needed.

## Architecture — Tactical DDD

The project uses **tactical Domain-Driven Design** patterns. Dependencies flow inward: `main.js` → `application/` → `domain/` and `infrastructure/`. Domain has no outward dependencies.

- **`domain/`** — pure business logic and state (aggregates, value objects). No Companion SDK or HTTP knowledge.
- **`infrastructure/`** — external communication: API DTOs (`sib-api/`), parsers as anti-corruption layer (`parsers/`), HTTP/WebSocket clients (`connection/`)
- **`application/`** — orchestrates domain + infrastructure into Companion concepts (actions, feedbacks, presets, variables). Includes factories (`actionFactory/`, `presetFactory/`) and controllers.
- **`main.js`** — composition root. Wires domain, infrastructure, and application together.
- **`test/`** — mirrors source directory structure.

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed per-file descriptions.

## Build and Test

- **Package Manager**: Yarn (use `yarn test`, NEVER `npm test`)
- **Test Runner**: Jest
- **Module System**: ES Modules
- **Build**: `yarn dist`
- **Dev**: `yarn dev`

## SIB API Connection Rules

- **Never make HTTP calls to SIB in parallel** — always sequential
- **Heartbeat** (`/api/hb`): polled every 10s via `sibConnectionHttpPull`. No auth required.
- **Heavy endpoints** (teams, quick buttons, rundowns): only called when `ComponentLastModified` timestamps change. See `sib-api` skill for full caching rules.
- **429 handling**: `SibRateLimitError` in `sibHttpClient.js`. On 429, break/skip remaining calls. Icon fetching retries from `main.js` (max 3 attempts, resets on data change).
- **Timer pattern**: `sibConnectionHttpPull` uses self-rescheduling `setTimeout` (not `setInterval`) to prevent tick overlap.
- **Config fields**: defined in `application/configFieldId.js`, wired through `SibConnection` constructor, consumed in `sibConnectionHttpPull`.

## Debugging with Browser

Use `@browser` / Chrome integration to read module logs from Companion's debug page:

- **Debug URL**: `http://127.0.0.1:8000/connection-debug/{connectionId}`
- Use `get_page_text` on the debug tab to read logs — module logs appear on the page, not in the browser console.
- Use `find` + `computer` to click "Clear log" button at the top of the debug page before reading to reduce noise.
- Do not add temporary `console.log` lines to diagnose issues. Use `logger.debug` if needed — it shows up on the Companion debug page.

## Testing Conventions

See [testing-guide.md](testing-guide.md) for full patterns.

Key rules:

- Mirror source file structure in `test/` directory
- ES module imports with `.js` extension required
- Follow Arrange-Act-Assert pattern with `// arrange`, `// act`, `// assert` comments
- Use [Faker.js](https://fakerjs.dev/api/) for variable data, NOT for logic-dependent values
- Use [Efate](https://www.npmjs.com/package/efate) fixtures for complex reusable test data
- Always test edge cases: `undefined`, `null`, empty objects, empty strings, boundary values
