# Companion Module Hooks Reference

This document summarizes all available hooks for Companion modules using `@companion-module/base`.

## Documentation Links

- [Official Companion Module Development Guide](https://github.com/bitfocus/companion-module-base/wiki)
- [Module Base API Reference](https://github.com/bitfocus/companion-module-base)
- [Module Configuration](https://github.com/bitfocus/companion-module-base/wiki/Module-configuration)
- [Actions](https://github.com/bitfocus/companion-module-base/wiki/Actions)
- [Feedbacks](https://github.com/bitfocus/companion-module-base/wiki/Feedbacks)

## Instance Lifecycle Hooks (Required)

These abstract methods **must** be implemented in your module class extending `InstanceBase`:

### `init(config, isFirstInit, secrets)`
Called once the module is ready to start doing things.

**Parameters:**
- `config: TConfig` - The module configuration
- `isFirstInit: boolean` - Whether this is the first initialization
- `secrets: TSecrets` - Secret values (passwords, tokens, etc.)

**Returns:** `void | Promise<void>`

**Example:** See `main.js:61`

```javascript
async init(config, isFirstInit, secrets) {
  // Set up connections, load data, initialize state
  this.config = config
  // ... connection setup
}
```

---

### `destroy()`
Called when the module is deleted or disabled. Clean up resources here.

**Returns:** `void | Promise<void>`

**Important:** Always clean up timers, connections, and event listeners to prevent memory leaks.

**Example:** See `main.js:176`

```javascript
async destroy() {
  this.connection?.disconnect()
  // Clear timers, close sockets, etc.
}
```

---

### `configUpdated(config, secrets)`
Called when the user updates the module configuration.

**Parameters:**
- `config: TConfig` - The updated configuration
- `secrets: TSecrets` - Updated secret values

**Returns:** `void | Promise<void>`

**Example:** See `main.js:187`

```javascript
async configUpdated(config, secrets) {
  this.config = config
  // Reconnect with new settings
  await this.connection.reconnect(config)
}
```

---

### `getConfigFields()`
Returns the configuration fields displayed in the Companion web UI.

**Returns:** `SomeCompanionConfigField[]`

**Example:** See `main.js:220`

```javascript
getConfigFields() {
  return [
    {
      type: 'textinput',
      id: 'host',
      label: 'Device IP',
      width: 12,
      default: '127.0.0.1'
    },
    {
      type: 'number',
      id: 'port',
      label: 'Port',
      width: 4,
      default: 8080,
      regex: Regex.PORT
    }
  ]
}
```

[Configuration Field Types Documentation](https://github.com/bitfocus/companion-module-base/wiki/Module-configuration)

---

## Optional Instance Hooks

### `handleHttpRequest(request)`
Handle HTTP requests sent to your module from Companion.

**Parameters:**
- `request: CompanionHTTPRequest` - Partial Express request object

**Returns:** `CompanionHTTPResponse | Promise<CompanionHTTPResponse>`

```javascript
handleHttpRequest(request) {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ok' })
  }
}
```

---

### `handleStartStopRecordActions(isRecording)`
Called when Companion starts or stops recording actions.

**Parameters:**
- `isRecording: boolean` - Whether recording is now active

**Returns:** `void`

```javascript
handleStartStopRecordActions(isRecording) {
  if (isRecording) {
    this.log('info', 'Recording started')
  }
}
```

---

## Action Hooks

Define actions using `this.setActionDefinitions(actions)`. Each action definition can include:

### `callback(action, context)` *(required)*
Executes when the action is triggered.

**Parameters:**
- `action: CompanionActionEvent` - Action information and options
- `context: CompanionActionContext` - Utility functions

**Returns:** `void | Promise<void>`

```javascript
{
  actionId: 'myAction',
  name: 'My Action',
  options: [...],
  callback: async (action, context) => {
    const value = action.options.someOption
    await this.sendCommand(value)
  }
}
```

---

### `subscribe(action, context)` *(optional)*
Called when an action is added, enabled, or its options change.

**Use case:** Load necessary data, establish subscriptions

**Parameters:**
- `action: CompanionActionInfo` - Action information
- `context: CompanionActionContext` - Utility functions

**Returns:** `void | Promise<void>`

```javascript
subscribe: async (action, context) => {
  // Ensure data needed for this action is loaded
  await this.loadRequiredData(action.options.deviceId)
}
```

**Note:** Use `optionsToIgnoreForSubscribe` to prevent certain option changes from triggering subscribe/unsubscribe.

---

### `unsubscribe(action, context)` *(optional)*
Called when an action is removed, disabled, or edited.

**Use case:** Clean up subscriptions or resources

**Parameters:**
- `action: CompanionActionInfo` - Action information
- `context: CompanionActionContext` - Utility functions

**Returns:** `void | Promise<void>`

```javascript
unsubscribe: (action, context) => {
  // Clean up resources for this action
  this.removeSubscription(action.id)
}
```

---

### `learn(action, context)` *(optional)*
Implements "learn" functionality to auto-populate action options from the device.

**Parameters:**
- `action: CompanionActionEvent` - Action information
- `context: CompanionActionContext` - Utility functions

**Returns:** `CompanionOptionValues | undefined | Promise<CompanionOptionValues | undefined>`

```javascript
learn: async (action, context) => {
  const currentState = await this.device.getCurrentState()
  return {
    someOption: currentState.value
  }
}
```

**Note:** Use `learnTimeout` property to set timeout (default: 5000ms)

[Actions Documentation](https://github.com/bitfocus/companion-module-base/wiki/Actions)

---

## Feedback Hooks

Define feedbacks using `this.setFeedbackDefinitions(feedbacks)`. Each feedback definition can include:

### `callback(feedback, context)` *(required)*
Returns the current state of the feedback.

**Types:**
- **Boolean:** Returns `boolean` - used for button styling
- **Value:** Returns `JsonValue` - used in expressions
- **Advanced:** Returns `CompanionAdvancedFeedbackResult` - full control over button appearance

**Parameters:**
- `feedback: CompanionFeedbackBooleanEvent | CompanionFeedbackValueEvent | CompanionFeedbackAdvancedEvent`
- `context: CompanionFeedbackContext` - Utility functions

**Returns:** Depends on feedback type

```javascript
// Boolean feedback
{
  type: 'boolean',
  name: 'Device Connected',
  defaultStyle: { color: combineRgb(0, 255, 0) },
  callback: (feedback, context) => {
    return this.isConnected
  }
}

// Value feedback
{
  type: 'value',
  name: 'Current Volume',
  callback: (feedback, context) => {
    return this.currentVolume
  }
}
```

---

### `subscribe(feedback, context)` *(optional)*
Called when a feedback is added or its options change.

**Use case:** Load data needed to evaluate the feedback

**Parameters:**
- `feedback: CompanionFeedbackInfo` - Feedback information
- `context: CompanionFeedbackContext` - Utility functions

**Returns:** `void | Promise<void>`

```javascript
subscribe: async (feedback, context) => {
  // Ensure we're monitoring the required state
  this.startMonitoring(feedback.options.parameter)
}
```

---

### `unsubscribe(feedback, context)` *(optional)*
Called when a feedback is removed or edited.

**Use case:** Clean up monitoring or subscriptions

**Parameters:**
- `feedback: CompanionFeedbackInfo` - Feedback information
- `context: CompanionFeedbackContext` - Utility functions

**Returns:** `void | Promise<void>`

```javascript
unsubscribe: (feedback, context) => {
  this.stopMonitoring(feedback.options.parameter)
}
```

---

### `learn(feedback, context)` *(optional)*
Implements "learn" functionality for feedback options.

**Parameters:**
- `feedback: CompanionFeedbackInfo` - Feedback information
- `context: CompanionFeedbackContext` - Utility functions

**Returns:** `CompanionOptionValues | undefined | Promise<CompanionOptionValues | undefined>`

```javascript
learn: async (feedback, context) => {
  const state = await this.device.getState()
  return {
    targetValue: state.currentValue
  }
}
```

[Feedbacks Documentation](https://github.com/bitfocus/companion-module-base/wiki/Feedbacks)

---

## Helper Methods

These methods are available on the `InstanceBase` class:

### State Management
- `setActionDefinitions(actions)` - Define available actions
- `setFeedbackDefinitions(feedbacks)` - Define available feedbacks
- `setPresetDefinitions(presets)` - Define button presets
- `setVariableDefinitions(variables)` - Define available variables
- `setVariableValues(values)` - Update variable values
- `getVariableValue(variableId)` - Get current variable value

### Feedback Control
- `checkFeedbacks(...feedbackTypes)` - Request feedbacks to be re-evaluated
- `checkFeedbacksById(...feedbackIds)` - Request specific feedback instances to be re-evaluated

### Action/Feedback Subscription
- `subscribeActions(...actionIds)` - Call subscribe on all placed actions
- `unsubscribeActions(...actionIds)` - Call unsubscribe on all placed actions
- `subscribeFeedbacks(...feedbackIds)` - Call subscribe on all placed feedbacks
- `unsubscribeFeedbacks(...feedbackIds)` - Call unsubscribe on all placed feedbacks

### Status & Logging
- `updateStatus(status, message)` - Update instance connection status
- `log(level, message)` - Write to the Companion log

### Other
- `saveConfig(newConfig, newSecrets)` - Save updated configuration
- `oscSend(host, port, path, args)` - Send OSC messages
- `recordAction(action, uniquenessId)` - Add action to recording session
- `createSharedUdpSocket(type, callback)` - Create shared UDP socket for multiple instances

---

## Status Enum Values

Use with `updateStatus()`:

```javascript
import { InstanceStatus } from '@companion-module/base'

InstanceStatus.Ok               // Everything is working
InstanceStatus.Connecting       // Connecting to device
InstanceStatus.Disconnected     // Not connected
InstanceStatus.ConnectionFailure // Connection failed
InstanceStatus.BadConfig        // Invalid configuration
InstanceStatus.UnknownWarning   // Warning state
InstanceStatus.UnknownError     // Error state
```

---

## Best Practices

1. **Always clean up in `destroy()`** - Clear timers, close connections, remove listeners
2. **Use `subscribe`/`unsubscribe`** - Only load data when actions/feedbacks are actually in use
3. **Call `checkFeedbacks()`** - When state changes that affects feedback evaluation
4. **Use `updateStatus()`** - Keep users informed about connection state
5. **Implement `configUpdated()`** - Allow configuration changes without restarting
6. **Validate configuration** - Check for required fields in `init()` and `configUpdated()`

---

## Current Module Implementation

This module (Sport In The Box) currently uses:

- ✅ `init()` - main.js:61
- ✅ `destroy()` - main.js:176
- ✅ `configUpdated()` - main.js:187
- ✅ `getConfigFields()` - main.js:220
- ✅ Action callbacks - application/actions.js
- ✅ Feedback callbacks - application/updateFeedbacks.js
- ✅ Variable definitions - application/variables.js
