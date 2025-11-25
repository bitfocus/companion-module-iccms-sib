# Bitfocus Companion Module - Actions Guide

## Overview

Actions are the commands that execute when a button is pressed in Companion. This guide provides patterns and best practices for implementing actions in Companion modules.

---

## Project-Specific Action Locations

In this project, actions are organized in the following files:

- **Action IDs**: [application/actionId.js](application/actionId.js) - Defines all action identifiers as constants
- **Action Definitions**: [application/actions.js](application/actions.js) - Contains action definitions, options, and callback implementations

---

## Documentation References

- **Module SDK**: <https://github.com/bitfocus/companion-module-base/wiki>
- **Action API**: Check `@companion-module/base` for `CompanionActionDefinitions`
- **Local Reference**: Review [actionId.js](application/actionId.js) and [actions.js](application/actions.js) for existing patterns in this module.

---

## Action Structure

### Basic Action Definition

```javascript
getActionDefinitions() {
    return {
        action_id: {
            name: 'Action Display Name',
            description: 'Detailed description of what this action does',
            options: [
                // Option definitions
            ],
            callback: async (action) => {
                // Action execution logic
            }
        }
    }
}
```

---

## Rule 1: Action Naming Conventions

### Action ID Format

Use descriptive, hierarchical naming:

```javascript
// Format: category_action_type
'camera_select'           // Select a camera
'audio_mute'             // Mute audio
'audio_unmute'           // Unmute audio
'pgm_set_source'         // Set program source
'pvw_set_source'         // Set preview source
'transition_auto'        // Perform auto transition
'recording_start'        // Start recording
'recording_stop'         // Stop recording
```

### Display Name Format

Use clear, operator-friendly names:

```javascript
name: 'Select Camera'
name: 'Mute Audio Channel'
name: 'Set Program Source'
name: 'Perform Auto Transition'
```

---

## Rule 2: Option Types and Patterns

### Number Input

```javascript
{
    type: 'number',
    label: 'Channel Number',
    id: 'channel',
    default: 1,
    min: 1,
    max: 16,
    required: true,
    range: true
}
```

### Dropdown Selection

```javascript
{
    type: 'dropdown',
    label: 'Source Type',
    id: 'source',
    default: 'camera',
    choices: [
        { id: 'camera', label: 'Camera' },
        { id: 'graphic', label: 'Graphic' },
        { id: 'media', label: 'Media Player' },
        { id: 'color', label: 'Color Generator' }
    ],
    required: true
}
```

### Dynamic Dropdown (Updates based on device state)

```javascript
{
    type: 'dropdown',
    label: 'Input Source',
    id: 'input',
    default: this.deviceInputs[0]?.id || 1,
    choices: this.deviceInputs.map(input => ({
        id: input.id,
        label: `${input.id}. ${input.name}`
    })),
    required: true
}
```

### Text Input

```javascript
{
    type: 'textinput',
    label: 'Custom Label',
    id: 'label',
    default: '',
    required: false,
    useVariables: true  // Allow Companion variables
}
```

### Checkbox (Boolean)

```javascript
{
    type: 'checkbox',
    label: 'Enable Fade',
    id: 'fade',
    default: false
}
```

---

## Rule 3: Action Implementation Patterns

### Pattern 1: Simple Command

```javascript
'device_power_on': {
    name: 'Power On Device',
    description: 'Turn on the device',
    options: [],
    callback: async (action) => {
        try {
            await this.sendCommand('POWER ON')
            this.log('info', 'Device powered on')
        } catch (error) {
            this.log('error', `Power on failed: ${error.message}`)
        }
    }
}
```

### Pattern 2: Parameterized Command

```javascript
'camera_select': {
    name: 'Select Camera',
    description: 'Switch to specified camera input',
    options: [
        {
            type: 'number',
            label: 'Camera Number',
            id: 'num',
            default: 1,
            min: 1,
            max: 10,
            required: true,
            range: true
        }
    ],
    callback: async (action) => {
        const cameraNum = action.options.num
        try {
            await this.sendCommand(`CAM ${cameraNum}`)
            this.log('info', `Switched to camera ${cameraNum}`)
            this.checkFeedbacks('camera_active')  // Update feedbacks
        } catch (error) {
            this.log('error', `Camera select failed: ${error.message}`)
        }
    }
}
```

### Pattern 3: Multi-Parameter Command

```javascript
'audio_level': {
    name: 'Set Audio Level',
    description: 'Set audio level for specified channel',
    options: [
        {
            type: 'number',
            label: 'Channel',
            id: 'channel',
            default: 1,
            min: 1,
            max: 8,
            required: true
        },
        {
            type: 'number',
            label: 'Level (dB)',
            id: 'level',
            default: 0,
            min: -60,
            max: 12,
            required: true,
            range: true
        }
    ],
    callback: async (action) => {
        const { channel, level } = action.options
        try {
            await this.sendCommand(`AUDIO ${channel} LEVEL ${level}`)
            this.log('info', `Set channel ${channel} to ${level}dB`)
        } catch (error) {
            this.log('error', `Audio level set failed: ${error.message}`)
        }
    }
}
```

### Pattern 4: Toggle Action

```javascript
'audio_mute_toggle': {
    name: 'Toggle Audio Mute',
    description: 'Toggle mute state for specified channel',
    options: [
        {
            type: 'number',
            label: 'Channel',
            id: 'channel',
            default: 1,
            min: 1,
            max: 8,
            required: true
        }
    ],
    callback: async (action) => {
        const channel = action.options.channel
        const currentState = this.audioChannels[channel]?.muted || false
        const newState = !currentState
        
        try {
            await this.sendCommand(`AUDIO ${channel} MUTE ${newState ? 'ON' : 'OFF'}`)
            this.audioChannels[channel].muted = newState
            this.log('info', `Channel ${channel} mute: ${newState}`)
            this.checkFeedbacks('audio_mute')  // Update feedback
        } catch (error) {
            this.log('error', `Mute toggle failed: ${error.message}`)
        }
    }
}
```

---

## Rule 4: Error Handling

### Always Use Try-Catch

```javascript
callback: async (action) => {
    try {
        await this.sendCommand('COMMAND')
    } catch (error) {
        this.log('error', `Action failed: ${error.message}`)
        // Don't throw - handle gracefully
    }
}
```

### Validate Options Before Execution

```javascript
callback: async (action) => {
    const { channel, value } = action.options
    
    // Validate range
    if (channel < 1 || channel > this.maxChannels) {
        this.log('warn', `Invalid channel: ${channel}`)
        return
    }
    
    // Validate connection
    if (!this.socket || !this.socket.isConnected) {
        this.log('warn', 'Device not connected')
        return
    }
    
    try {
        await this.sendCommand(`CH ${channel} VAL ${value}`)
    } catch (error) {
        this.log('error', `Command failed: ${error.message}`)
    }
}
```

---

## Rule 5: State Management

### Update Module State After Actions

```javascript
callback: async (action) => {
    const sourceNum = action.options.source
    
    try {
        await this.sendCommand(`PGM ${sourceNum}`)
        
        // Update internal state
        this.currentProgramSource = sourceNum
        
        // Trigger feedback updates
        this.checkFeedbacks('program_source')
        
        // Update variables if applicable
        this.setVariableValues({
            program_source: sourceNum
        })
        
        this.log('info', `Program source set to ${sourceNum}`)
    } catch (error) {
        this.log('error', `Failed to set program source: ${error.message}`)
    }
}
```

---

## Rule 6: Action Organization

### Group Related Actions

```javascript
getActionDefinitions() {
    return {
        // Camera Controls
        'camera_select': { ... },
        'camera_preset_recall': { ... },
        'camera_preset_save': { ... },
        
        // Audio Controls
        'audio_mute': { ... },
        'audio_unmute': { ... },
        'audio_level': { ... },
        
        // Transition Controls
        'transition_auto': { ... },
        'transition_cut': { ... },
        'transition_fade': { ... }
    }
}
```

---

## Rule 7: Working with Variables

### Support Companion Variables in Text Fields

```javascript
{
    type: 'textinput',
    label: 'Display Text',
    id: 'text',
    default: '',
    useVariables: true  // Enable variable parsing
}
```

### Parse Variables Before Use

```javascript
callback: async (action) => {
    // Parse variables in text input
    const parsedText = await this.parseVariablesInString(action.options.text)
    
    try {
        await this.sendCommand(`TEXT ${parsedText}`)
    } catch (error) {
        this.log('error', `Text command failed: ${error.message}`)
    }
}
```

---

## Rule 8: Async Best Practices

### Use Async/Await Pattern

```javascript
// ✅ GOOD
callback: async (action) => {
    try {
        await this.sendCommand('CMD1')
        await this.sendCommand('CMD2')
        this.log('info', 'Commands completed')
    } catch (error) {
        this.log('error', `Failed: ${error.message}`)
    }
}

// ❌ BAD - Don't use .then()/.catch() chains
callback: (action) => {
    this.sendCommand('CMD1')
        .then(() => this.sendCommand('CMD2'))
        .catch(error => console.log(error))
}
```

---

## Rule 9: Common Patterns

### Recall Preset/Snapshot

```javascript
'preset_recall': {
    name: 'Recall Preset',
    description: 'Load a saved preset configuration',
    options: [
        {
            type: 'number',
            label: 'Preset Number',
            id: 'preset',
            default: 1,
            min: 1,
            max: 100,
            required: true
        }
    ],
    callback: async (action) => {
        const presetNum = action.options.preset
        try {
            await this.sendCommand(`PRESET RECALL ${presetNum}`)
            this.log('info', `Recalled preset ${presetNum}`)
        } catch (error) {
            this.log('error', `Preset recall failed: ${error.message}`)
        }
    }
}
```

### Transport Controls

```javascript
'transport_play': {
    name: 'Play',
    description: 'Start playback',
    options: [],
    callback: async (action) => {
        try {
            await this.sendCommand('PLAY')
            this.transportState = 'playing'
            this.checkFeedbacks('transport_state')
            this.log('info', 'Playback started')
        } catch (error) {
            this.log('error', `Play failed: ${error.message}`)
        }
    }
}
```

---

## Quick Reference: Action Template

```javascript
'action_id': {
    name: 'Action Display Name',
    description: 'What this action does',
    options: [
        {
            type: 'number',  // or 'dropdown', 'textinput', 'checkbox'
            label: 'Parameter Label',
            id: 'param_id',
            default: 1,
            required: true
        }
    ],
    callback: async (action) => {
        const param = action.options.param_id
        
        // Validate if needed
        if (!this.socket?.isConnected) {
            this.log('warn', 'Not connected')
            return
        }
        
        try {
            // Execute command
            await this.sendCommand(`CMD ${param}`)
            
            // Update state if needed
            this.currentState = param
            
            // Trigger feedback updates
            this.checkFeedbacks('feedback_id')
            
            // Log success
            this.log('info', `Action completed: ${param}`)
        } catch (error) {
            this.log('error', `Action failed: ${error.message}`)
        }
    }
}
```

---

## Summary: Key Principles

1. **Descriptive IDs**: Use clear, hierarchical action IDs
2. **Error Handling**: Always wrap commands in try-catch blocks
3. **State Updates**: Update module state and trigger feedback checks
4. **Validation**: Validate options before execution
5. **Async/Await**: Use modern async patterns consistently
6. **Logging**: Log both successes and failures appropriately
7. **User Feedback**: Provide clear option labels and descriptions
8. **Organization**: Group related actions logically

---

## When in Doubt

1. **Check existing actions** in `actions.js` for patterns
2. **Review device API** documentation for command format
3. **Test thoroughly** with actual hardware when possible
4. **Log extensively** during development for debugging
5. **Handle errors gracefully** - don't crash the module
