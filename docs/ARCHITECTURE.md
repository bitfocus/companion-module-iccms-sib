# Architecture — Detailed File Reference

This document expands on the tactical DDD layers described in [CLAUDE.md](../CLAUDE.md).

## `domain/` — Domain Layer

Pure business logic and state, no knowledge of Companion SDK or HTTP.

- `sibComputer.js` — aggregate that holds all SIB state (info, collections, teams, rundowns)
- `sibIcons.js` — icon cache and fetching logic
- `iconUtils.js` — icon ID extraction helpers
- `teamLogos.js` — team logo processing
- `imageProcessing.js` — image format conversion utilities

## `infrastructure/` — Infrastructure Layer

External communication and data transformation.

- `sib-api/` — **DTOs**: plain classes matching SIB2 REST API response shapes (e.g. `ApiSportTeamWithoutPlayers`, `ApiRundownWithoutItemsDto`)
- `parsers/` — **Anti-Corruption Layer**: transform raw API JSON into DTO instances with safe defaults via `object-path`
- `connection/` — HTTP client (`sibHttpClient.js`), WebSocket (`sibWebSocket.js`), polling loop (`sibConnectionHttpPull.js`), connection config (`sibConnection.js`), event wiring (`sibConnectionEvents.js`)

### Authentication — two distinct passwords

SIB exposes two separate credentials. `SibConnection` carries both; do not confuse them.

- **`token`** — config field `SibPass`, module UI label _API Password_, sourced from SIB _General settings → API_. Authenticates the **REST API** (`/api/...`): heartbeat, teams, quick buttons, rundowns, and **rundown control**.
- **`helperToken`** — config field `SibHelperPass`, module UI label _Helper Password_, sourced from the **service helper in the tray menu**. Used only by the WebSocket (`sibWebSocket.js`) and the _Open database_ action.

**Rule of thumb:** anything hitting an `/api/...` REST endpoint authenticates with `token`. Only the tray-helper paths (WebSocket, open database) use `helperToken`. REST calls append the password as a path segment (e.g. `/api/rundown/select-rundown/1/<token>`); when the API has no password set, the segment is omitted.

## `application/` — Application Layer

Orchestrates domain and infrastructure into Companion module concepts (actions, feedbacks, presets, variables).

- `actions.js` / `actionId.js` — action definitions, IDs, and runtime wiring
- `feedbacks.js` / `feedbackId.js` — feedback definitions and callbacks
- `presets.js` / `variables.js` — preset and variable definitions
- `configFieldId.js` — module config field identifiers
- `actionFactory/` — factories that build action definitions (see `createRundownControlAction.js` for constants pattern)
- `presetFactory/` — factories that build presets from domain data (teams, buttons, rundowns)
- `controllers/` — orchestration: `syncSibDataToCompanion.js` wires data from SIB API into Companion actions and presets

## `main.js` — Composition Root

Extends `InstanceBase` from Companion SDK. Creates domain objects (`SibComputer`, `SibIcons`), infrastructure connections, and wires everything together.
