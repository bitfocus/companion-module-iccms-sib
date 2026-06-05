# Bitfocus Companion Module - Feedbacks Guide

## Overview

Feedbacks provide visual indicators on buttons based on the current state of the device. This guide covers patterns and best practices for implementing feedbacks in Companion modules.

---

## Documentation References

- **Module SDK**: <https://github.com/bitfocus/companion-module-base/wiki>
- **Feedback API**: Check `@companion-module/base` for `CompanionFeedbackDefinitions`
- **Local Reference**: Review `feedbacks.js` in your module for existing patterns

---

## Feedback Structure

### Basic Feedback Definition

```javascript
getFeedbackDefinitions() {
    return {
        feedback_id: {
            type: 'boolean',  // or 'advanced'
            name: 'Feedback Display Name',
            description: 'What this feedback indicates',
            defaultStyle: {
                bgcolor: combineRgb(255, 0, 0),
                color: combineRgb(255, 255, 255)
            },
            options: [
                // Option definitions
            ],
            callback: (feedback) => {
                // Return true/false for boolean type
                // Return style object for advanced type
            }
        }
    }
}
```

---

## Rule 1: Feedback Naming Conventions

### Feedback ID Format

Use descriptive, state-based naming:

```javascript
// Format: state_description
'camera_active'           // Camera is currently active
'audio_muted'            // Audio channel is muted
'source_on_program'      // Source is on program bus
'recording_active'       // Recording is in progress
'transport_playing'      // Transport is playing
'preset_loaded'          // Preset is currently loaded
'connection_status'      // Connection state indicator
```

### Display Name Format

Use clear, state-describing names:

```javascript
name: 'Camera Active'
name: 'Audio Channel Muted'
name: 'Source on Program'
name: 'Recording Active'
```

---

## Rule 2: Feedback Types

### Boolean Feedback (Most Common)

Boolean feedbacks change button appearance when condition is true:

```javascript
'camera_active': {
    type: 'boolean',
    name: 'Camera Active',
    description: 'Indicates if this camera is currently selected',
    defaultStyle: {
        bgcolor: combineRgb(255, 0, 0),  // Red when active
        color: combineRgb(255, 255, 255)
    },
    options: [
        {
            type: 'number',
            label: 'Camera Number',
            id: 'num',
            default: 1,
            min: 1,
            max: 10,
            required: true
        }
    ],
    callback: (feedback) => {
        return this.currentCamera === feedback.options.num
    }
}
```

### Advanced Feedback (Dynamic Styling)

Advanced feedbacks return custom styles based on multiple states:

```javascript
'audio_level': {
    type: 'advanced',
    name: 'Audio Level Indicator',
    description: 'Changes color based on audio level',
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
    callback: (feedback) => {
        const channel = feedback.options.channel
        const level = this.audioLevels[channel] || 0
        
        let bgcolor
        if (level > -6) {
            bgcolor = combineRgb(255, 0, 0)    // Red - clipping
        } else if (level > -20) {
            bgcolor = combineRgb(255, 255, 0)  // Yellow - hot
        } else {
            bgcolor = combineRgb(0, 255, 0)    // Green - normal
        }
        
        return {
            bgcolor: bgcolor,
            color: combineRgb(0, 0, 0)
        }
    }
}
```

---

## Rule 3: Common Feedback Patterns

### Pattern 1: Simple State Check

```javascript
'source_on_program': {
    type: 'boolean',
    name: 'Source on Program',
    description: 'Indicates if source is on program bus',
    defaultStyle: {
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(255, 255, 255)
    },
    options: [
        {
            type: 'number',
            label: 'Source Number',
            id: 'source',
            default: 1,
            required: true
        }
    ],
    callback: (feedback) => {
        return this.programSource === feedback.options.source
    }
}
```

### Pattern 2: Multi-State Comparison

```javascript
'source_active': {
    type: 'boolean',
    name: 'Source Active',
    description: 'Indicates if source is active on any bus',
    defaultStyle: {
        bgcolor: combineRgb(208, 179, 75),  // Gold
        color: combineRgb(0, 0, 0)
    },
    options: [
        {
            type: 'number',
            label: 'Source Number',
            id: 'source',
            default: 1,
            required: true
        }
    ],
    callback: (feedback) => {
        const src = feedback.options.source
        return (
            this.programSource === src ||
            this.previewSource === src ||
            this.auxSources.includes(src)
        )
    }
}
```

### Pattern 3: Range-Based Feedback

```javascript
'temperature_warning': {
    type: 'advanced',
    name: 'Temperature Warning',
    description: 'Indicates device temperature status',
    options: [],
    callback: (feedback) => {
        const temp = this.deviceTemperature || 0
        
        if (temp > 80) {
            return {
                bgcolor: combineRgb(255, 0, 0),    // Red - critical
                color: combineRgb(255, 255, 255),
                text: `TEMP\\n${temp}°C`
            }
        } else if (temp > 60) {
            return {
                bgcolor: combineRgb(255, 165, 0),  // Orange - warning
                color: combineRgb(0, 0, 0),
                text: `TEMP\\n${temp}°C`
            }
        }
        
        return {}  // No change if temp is normal
    }
}
```

### Pattern 4: Connection Status

```javascript
'connection_status': {
    type: 'boolean',
    name: 'Device Connected',
    description: 'Indicates connection status',
    defaultStyle: {
        bgcolor: combineRgb(0, 255, 0),  // Green when connected
        color: combineRgb(0, 0, 0)
    },
    options: [],
    callback: (feedback) => {
        return this.socket && this.socket.isConnected
    }
}
```

---

## Rule 4: Feedback Options

### Number Options

```javascript
options: [
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
]
```

### Dropdown Options

```javascript
options: [
    {
        type: 'dropdown',
        label: 'Bus',
        id: 'bus',
        default: 'program',
        choices: [
            { id: 'program', label: 'Program' },
            { id: 'preview', label: 'Preview' },
            { id: 'aux1', label: 'AUX 1' },
            { id: 'aux2', label: 'AUX 2' }
        ],
        required: true
    }
]
```

### Dynamic Dropdown

```javascript
options: [
    {
        type: 'dropdown',
        label: 'Source',
        id: 'source',
        default: this.sources[0]?.id || 1,
        choices: this.sources.map(src => ({
            id: src.id,
            label: src.name
        })),
        required: true
    }
]
```

---

## Rule 5: Default Styles

### Use Function-Based Colors

```javascript
defaultStyle: {
    // Active states - Red
    bgcolor: combineRgb(255, 0, 0),
    color: combineRgb(255, 255, 255)
}

defaultStyle: {
    // Selected states - Gold
    bgcolor: combineRgb(208, 179, 75),
    color: combineRgb(0, 0, 0)
}

defaultStyle: {
    // Success states - Green
    bgcolor: combineRgb(0, 204, 0),
    color: combineRgb(0, 0, 0)
}

defaultStyle: {
    // Warning states - Yellow
    bgcolor: combineRgb(255, 255, 0),
    color: combineRgb(0, 0, 0)
}

defaultStyle: {
    // Error states - Red
    bgcolor: combineRgb(255, 0, 0),
    color: combineRgb(255, 255, 255)
}
```

---

## Rule 6: Triggering Feedback Updates

### After Actions

```javascript
callback: async (action) => {
    try {
        await this.sendCommand(`CAM ${action.options.num}`)
        this.currentCamera = action.options.num
        
        // Trigger feedback check
        this.checkFeedbacks('camera_active')
        
    } catch (error) {
        this.log('error', `Command failed: ${error.message}`)
    }
}
```

### After State Updates

```javascript
handleDeviceData(data) {
    const oldProgram = this.programSource
    this.programSource = data.programSource
    
    // Only check feedbacks if state changed
    if (oldProgram !== this.programSource) {
        this.checkFeedbacks('source_on_program', 'source_active')
    }
}
```

### Periodic Updates

```javascript
init(config) {
    // ...
    
    // Poll for state updates every second
    this.pollInterval = setInterval(() => {
        this.queryDeviceState()
    }, 1000)
}

queryDeviceState() {
    // Get device state
    // Update internal state
    // Check all feedbacks if needed
    this.checkFeedbacks()
}
```

---

## Rule 7: Performance Considerations

### Efficient Callback Logic

```javascript
// ✅ GOOD - Direct comparison
callback: (feedback) => {
    return this.currentSource === feedback.options.source
}

// ❌ BAD - Unnecessary computation
callback: (feedback) => {
    const sources = this.getAllSources()
    const current = sources.find(s => s.active)
    return current?.id === feedback.options.source
}
```

### Selective Feedback Updates

```javascript
// Update only specific feedbacks
this.checkFeedbacks('camera_active')

// Update multiple related feedbacks
this.checkFeedbacks('source_on_program', 'source_on_preview')

// Update all feedbacks (use sparingly)
this.checkFeedbacks()
```

---

## Rule 8: Feedback Organization

### Group Related Feedbacks

```javascript
getFeedbackDefinitions() {
    return {
        // Source Status Feedbacks
        'source_on_program': { ... },
        'source_on_preview': { ... },
        'source_active': { ... },
        
        // Audio Feedbacks
        'audio_muted': { ... },
        'audio_level': { ... },
        'audio_clipping': { ... },
        
        // Transport Feedbacks
        'transport_playing': { ... },
        'transport_paused': { ... },
        'transport_recording': { ... },
        
        // System Feedbacks
        'connection_status': { ... },
        'device_temperature': { ... }
    }
}
```

---

## Rule 9: Advanced Feedback Features

### Text Override in Advanced Feedback

```javascript
'preset_loaded': {
    type: 'advanced',
    name: 'Show Loaded Preset',
    description: 'Displays currently loaded preset number',
    options: [],
    callback: (feedback) => {
        if (this.currentPreset > 0) {
            return {
                bgcolor: combineRgb(0, 204, 0),
                color: combineRgb(0, 0, 0),
                text: `PRESET\\n${this.currentPreset}`
            }
        }
        return {}
    }
}
```

### PNG Icon Override

```javascript
'recording_active': {
    type: 'advanced',
    name: 'Recording Indicator',
    description: 'Shows recording icon when active',
    options: [],
    callback: (feedback) => {
        if (this.isRecording) {
            return {
                bgcolor: combineRgb(255, 0, 0),
                color: combineRgb(255, 255, 255),
                png64: this.recordingIcon  // Base64 encoded PNG
            }
        }
        return {}
    }
}
```

---

## Rule 10: Testing Feedbacks

### Test Different States

```javascript
// Verify feedback responds to all relevant states
'source_active': {
    type: 'boolean',
    name: 'Source Active',
    defaultStyle: {
        bgcolor: combineRgb(208, 179, 75),
        color: combineRgb(0, 0, 0)
    },
    options: [
        {
            type: 'number',
            label: 'Source',
            id: 'source',
            default: 1
        }
    ],
    callback: (feedback) => {
        const src = feedback.options.source
        
        // Test: Check all possible active states
        const onProgram = this.programSource === src
        const onPreview = this.previewSource === src
        const onAux = this.auxSources.includes(src)
        
        return onProgram || onPreview || onAux
    }
}
```

---

## Quick Reference: Feedback Template

```javascript
'feedback_id': {
    type: 'boolean',  // or 'advanced'
    name: 'Feedback Display Name',
    description: 'What state this indicates',
    defaultStyle: {
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(255, 255, 255)
    },
    options: [
        {
            type: 'number',
            label: 'Parameter Label',
            id: 'param_id',
            default: 1,
            required: true
        }
    ],
    callback: (feedback) => {
        const param = feedback.options.param_id
        
        // For boolean type: return true/false
        return this.currentState === param
        
        // For advanced type: return style object
        // return {
        //     bgcolor: combineRgb(255, 0, 0),
        //     color: combineRgb(255, 255, 255),
        //     text: 'ACTIVE'
        // }
    }
}
```

---

## Summary: Key Principles

1. **State-Based**: Feedbacks reflect current device state
2. **Efficient**: Keep callback logic simple and fast
3. **Selective Updates**: Only check feedbacks when state changes
4. **Clear Styling**: Use consistent colors for similar states
5. **Boolean First**: Use boolean type unless dynamic styling needed
6. **combineRgb()**: Always use for color definitions
7. **Descriptive Names**: Clear indication of what state is shown
8. **Performance**: Avoid expensive operations in callbacks

---

## When in Doubt

1. **Check existing feedbacks** in `feedbacks.js` for patterns
2. **Use boolean type** unless you need dynamic styling
3. **Test all states** to ensure feedback works correctly
4. **Update selectively** - only check relevant feedbacks after state changes
5. **Keep callbacks simple** - complex logic belongs in state management
6. **Document state dependencies** - note what triggers feedback updates
