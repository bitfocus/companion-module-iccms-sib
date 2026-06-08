# companion-module-iccms-sib

Bitfocus Companion module for [Sport In The Box 2](https://www.iccmediasport.com/en/sport-in-the-box/) (SIB2) — a production and playout system for live content on videoboards, in-house TV systems, and streaming.

![main_form](companion/sibMainForm.png)

## Features

- Fire QuickButtons from Stream Deck
- Open and change SIB database
- Change team

## Installation

1. [Download and install Companion v3+](https://bitfocus.io/companion)
2. In Companion, add a new connection and search for **Sport In The Box**

New to Companion? Watch [Getting Started with Companion](https://www.youtube.com/watch?v=jjbxzVrAG4M) or [Working with Companion Variables](https://www.youtube.com/watch?v=ONDNFpv-uCM).

## Setup

### SIB API Password

Set the API password in SIB under **Settings > General > API**, then enter it in the module connection settings in Companion.

![sib_api_pass](companion/sibApiPass.png)

### Triggering QuickButtons

The module fires QuickButton events using the **Trigger ID** shown in SIB.

![qb_trigger_id](companion/sibQuickButtonsTriggerId.png)

## Development

- **Package manager**: Yarn
- **Tests**: `yarn test`
- **Build**: `yarn dist`
- **Dev**: `yarn dev`
- **Node version**: 18.12+

See the [module development wiki](https://github.com/bitfocus/companion-module-base/wiki) for general Companion module guidance.

## How to Contribute

Mail us :)
