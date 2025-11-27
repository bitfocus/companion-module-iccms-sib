# Bitfocus Companion Module Development Rules

## Documentation References

### Official Documentation

- **Presets Guide**: [Companion Module Base - Presets](https://github.com/bitfocus/companion-module-base/wiki/Presets)
- **TypeScript Interface**: [CompanionButtonPresetDefinition](https://bitfocus.github.io/companion-module-base/interfaces/CompanionButtonPresetDefinition.html)
- **Button Style Props**: [CompanionButtonStyleProps](https://bitfocus.github.io/companion-module-base/interfaces/CompanionButtonStyleProps.html)
- **Preset Options**: [CompanionButtonPresetOptions](https://bitfocus.github.io/companion-module-base/interfaces/CompanionButtonPresetOptions.html)
- **Module SDK**: [Companion Module Base](https://github.com/bitfocus/companion-module-base)

### When Uncertain About Preset Creation

- **Primary Reference**: Always check official docs above first
- **TypeScript Definitions**: Review interface definitions for complete property lists
- **Module SDK API**: <https://github.com/bitfocus/companion-module-base/wiki>

### For Specific Topics

- **Preset Structure**: See [Preset Structure Reference](#preset-structure-reference) for required vs optional properties
- **Advanced Options**: See [Advanced Options](#advanced-options) for rotary encoders, step control, delays, and hold actions
- **Color Palette**: Reference [Official Companion Color Palette](#official-companion-color-palette) for standard colors
- **Unicode Icons**: See [Unicode Icons in Button Text](#unicode-icons-in-button-text) for playback controls and symbols
- **Constraints**: Review [Important Constraints and Limitations](#important-constraints-and-limitations) before implementing
- **Actions**: Check [actionId.js](application/actionId.js) for valid `actionId` values
- **Feedbacks**: Check [feedbacks.js](application/feedbacks.js) for valid `feedbackId` values
- **Loops**: See [Rule 1: Always Use Loops for Repetitive Presets](#rule-1-always-use-loops-for-repetitive-presets)

### Troubleshooting

- **Preset not appearing** → Check category path format (use forward slashes: `'Category/Subcategory'`)
- **Action not triggering** → Verify `actionId` exists in your module's actions (internal actions not available)
- **Feedback not working** → Ensure `feedbackId` matches a valid feedback in [feedbacks.js](application/feedbacks.js)
- **Colors incorrect** → Confirm using `combineRgb(r, g, b)` function
- **Button text not displaying** → Check escape sequences (`\\n` for line breaks in JavaScript/TypeScript)
- **Missing required properties** → Review [CompanionButtonPresetDefinition](https://bitfocus.github.io/companion-module-base/interfaces/CompanionButtonPresetDefinition.html)

---

## Preset Structure Reference

### Required vs Optional Properties

**Reference**: [CompanionButtonPresetDefinition](https://bitfocus.github.io/companion-module-base/interfaces/CompanionButtonPresetDefinition.html)

```typescript
interface CompanionButtonPresetDefinition {
    type: "button"                              // ✅ REQUIRED
    category: string                            // ✅ REQUIRED - Groups presets in UI
    name: string                                // ✅ REQUIRED - Display name
    style: CompanionButtonStyleProps            // ✅ REQUIRED - Base visual style
    previewStyle?: CompanionButtonStyleProps    // ⚠️ OPTIONAL - Preview in GUI
    options?: CompanionButtonPresetOptions      // ⚠️ OPTIONAL - Rotary actions, etc.
    feedbacks: CompanionPresetFeedback[]        // ✅ REQUIRED - Can be empty []
    steps: CompanionButtonStepActions[]         // ✅ REQUIRED - Button actions
}
```

### Minimal Valid Preset

```javascript
presets['minimal_example'] = {
    type: 'button',                    // ✅ Required
    category: 'Category Name',         // ✅ Required
    name: 'Preset Name',               // ✅ Required
    style: {                           // ✅ Required
        text: 'BUTTON',
        size: 'auto',
        color: combineRgb(255, 255, 255),
        bgcolor: combineRgb(0, 0, 0)
    },
    steps: [{                          // ✅ Required
        down: [{
            actionId: 'some_action',
            options: {}
        }],
        up: []
    }],
    feedbacks: []                      // ✅ Required (can be empty)
}
```

### Advanced Options

#### Rotary Encoder Support

Enable rotary encoder actions with `options.rotaryActions`:

```javascript
presets['rotary_example'] = {
    type: 'button',
    category: 'Rotary',
    name: 'Volume Control',
    style: { text: 'VOL', size: 'auto', color: combineRgb(255, 255, 255), bgcolor: combineRgb(0, 0, 0) },
    options: {
        rotaryActions: true  // ⚠️ Enable rotary encoder support
    },
    steps: [{
        down: [{ actionId: 'mute_toggle', options: {} }],
        up: [],
        rotate_left: [{ actionId: 'volume_down', options: {} }],
        rotate_right: [{ actionId: 'volume_up', options: {} }]
    }],
    feedbacks: []
}
```

#### Step Auto-Progress Control

Disable automatic step progression:

```javascript
presets['manual_step'] = {
    type: 'button',
    category: 'Transport',
    name: 'Play Toggle',
    style: { text: 'PLAY', size: 'auto', color: combineRgb(255, 255, 255), bgcolor: combineRgb(0, 204, 0) },
    options: {
        stepAutoProgress: false  // ⚠️ Prevent auto-advance to next step
    },
    steps: [
        {
            down: [{ actionId: 'play', options: {} }],
            up: []
        },
        {
            down: [{ actionId: 'stop', options: {} }],
            up: []
        }
    ],
    feedbacks: []
}
```

#### Action Delays

Add delays to individual actions:

```javascript
steps: [{
    down: [
        {
            actionId: 'fade_out',
            options: {},
            delay: 0  // Execute immediately
        },
        {
            actionId: 'switch_source',
            options: { num: 2 },
            delay: 1000  // Wait 1 second before executing
        },
        {
            actionId: 'fade_in',
            options: {},
            delay: 2000  // Wait 2 seconds before executing
        }
    ],
    up: []
}]
```

#### Duration Groups (Hold Actions)

Execute actions while button is held:

```javascript
steps: [{
    down: [{ actionId: 'start_recording', options: {} }],
    up: [{ actionId: 'stop_recording', options: {} }],
    // Actions to execute while held for specific durations
    1000: {  // After 1 second
        actions: [{ actionId: 'show_timer', options: {} }],
        runWhileHeld: false
    },
    5000: {  // After 5 seconds
        actions: [{ actionId: 'warning_beep', options: {} }],
        runWhileHeld: true  // Keep executing while held
    }
}]
```

---

## Rule 1: Always Use Loops for Repetitive Presets

### When to Detect Patterns

When user requests presets that involve:

- **Numbered sequences**: "8 cameras", "12 channels", "sources 1-16"
- **Similar controls**: "microphones 1-4", "AUX outputs 1-8"
- **Variants of same control**: "hard cameras 1-10", "soft cameras 1-10"

### Pattern Recognition

**NEVER** create repetitive presets by copy-pasting individual definitions.
**ALWAYS** use `for` loops to generate similar presets programmatically.

### Examples

**❌ BAD - Repetitive code:**

```javascript
presets['cam_1'] = { type: 'button', category: 'Camera', name: '1. Camera 1', ... }
presets['cam_2'] = { type: 'button', category: 'Camera', name: '2. Camera 2', ... }
presets['cam_3'] = { type: 'button', category: 'Camera', name: '3. Camera 3', ... }
// ... repeated 10+ times
```

**✅ GOOD - Loop-based generation:**

```javascript
// Add header first
presets['header_cameras'] = {
    type: 'text',
    category: 'Camera',
    name: 'Cameras',
    text: 'Camera Presets'
}

// Generate presets in loop
for (let i = 1; i <= 10; i++) {
    presets[`cam_${i}`] = {
        type: 'button',
        category: 'Camera',
        name: `${i}. Camera ${i}`,
        style: {
            text: `CAM ${i}`,
            size: 'auto',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 0)
        },
        steps: [{
            down: [{
                actionId: 'select_camera',
                options: { num: i }
            }],
            up: []
        }],
        feedbacks: []
    }
}
```

### Auto-Detection Rules

When user says:

- "Create 8 camera presets" → Use loop: `for (let i = 1; i <= 8; i++)`
- "Add presets for channels 1-12" → Use loop: `for (let i = 1; i <= 12; i++)`
- "Make buttons for sources 1 through 6" → Use loop: `for (let i = 1; i <= 6; i++)`

### Code Efficiency Target

- **Target**: Reduce ~350 lines of repetitive code → ~50 lines with loops
- **Scalability**: A loop-based approach should easily scale from 10 to 100+ items

---

## Rule 2: Preset Naming Conventions

### Preset ID Format

Use consistent, descriptive naming:

```javascript
// Format: ${category}_${type}_${identifier}
presets['cam_1']                // Camera preset #1
presets['audio_mic_1']          // Audio microphone #1
presets['pgm_source_cam1']      // Program bus camera source #1
presets['pvw_source_1']         // Preview bus source #1
presets['aux1_source_1']        // AUX 1 source #1
```

### Display Name Format

**Always** include number prefix for sorting:

```javascript
name: `${i}. Camera ${i}`       // "1. Camera 1", "2. Camera 2", etc.
name: `${i}. Source ${i}`       // Ensures alphabetical sorting works
```

### Button Text Format

Use brief, operator-friendly labels with `\\n` for line breaks:

```javascript
text: `CAM ${i}`                // Single line
text: `PGM\\nCAM ${i}`          // Two lines (Program / Camera)
text: `CAM ${i}\\nHARD`         // Camera number / Type
```

### Header Naming

Use `header_` prefix for text-type presets:

```javascript
presets['header_cameras'] = { type: 'text', ... }
presets['header_audio_inputs'] = { type: 'text', ... }
presets['header_pgm_sources'] = { type: 'text', ... }
```

---

## Rule 3: Organization Standards

### Always Include Headers

**ALWAYS** add a text header before groups of similar presets:

```javascript
// Header first
presets['header_cameras'] = {
    type: 'text',
    category: 'Switcher/Program/Sources/Cameras',
    name: 'Program Cameras',
    text: 'Program Camera Sources'
}

// Then buttons
for (let i = 1; i <= 10; i++) {
    presets[`pgm_cam_${i}`] = { ... }
}
```

### Break Up Large Lists

For lists with 10+ items, use multiple headers:

```javascript
// First group: 1-6
presets['header_cameras_1'] = {
    type: 'text',
    category: 'Camera',
    name: 'Cameras',
    text: 'Camera Sources 1-6'
}
for (let i = 1; i <= 6; i++) { ... }

// Second group: 7-12
presets['header_cameras_2'] = {
    type: 'text',
    category: 'Camera',
    name: 'Cameras (Continued)',
    text: 'Camera Sources 7-12'
}
for (let i = 7; i <= 12; i++) { ... }
```

### Category Path Structure

Use forward slashes (`/`) for hierarchical organization:

```javascript
category: 'Switcher/Program/Sources/Cameras'
category: 'Audio/Inputs/Microphones/Mic1'
category: 'Control/Transport/Playback'
```

**Best Practices:**

- 2-4 levels deep maximum
- Clear, descriptive names
- Consider operator workflows
- Group related functionality

---

## Rule 4: Color Coding Standards

### Official Companion Color Palette

**Reference**: [Companion Presets Guide - Design Recommendations](https://github.com/bitfocus/companion-module-base/wiki/Presets#design-recommendations)

Use the standard Companion color palette for consistency across modules:

```javascript
// ✅ OFFICIAL PALETTE - Use these for consistency

// RED (255, 0, 0) - Stop/Halt/Danger
bgcolor: combineRgb(255, 0, 0)
// Use for: Stop, Mute, Error states, Disconnect

// GREEN (0, 204, 0) - Play/Take/Go
bgcolor: combineRgb(0, 204, 0)
// Use for: Play, Take, Unmute, Connected, Success

// YELLOW (255, 255, 0) - Pause/Hold/Warning
bgcolor: combineRgb(255, 255, 0)
color: combineRgb(0, 0, 0)  // ⚠️ Use black text on yellow
// Use for: Pause, Hold, Warning states

// BLUE (0, 51, 204) - Auxiliary/Active States
bgcolor: combineRgb(0, 51, 204)
// Use for: AUX outputs, Preview, Active selections

// PURPLE (255, 0, 255) - Configuration Required
bgcolor: combineRgb(255, 0, 255)
// Use for: Presets that need user configuration

// BLACK (0, 0, 0) - Neutral/Default
bgcolor: combineRgb(0, 0, 0)
// Use for: Default state, neutral controls

// GOLD (208, 179, 75) - Active Feedback State
bgcolor: combineRgb(208, 179, 75)
color: combineRgb(0, 0, 0)  // ⚠️ Use black text on gold
// Use for: Feedback when item is active/selected
```

### Project-Specific Colors

Additional colors for specific use cases:

```javascript
// Camera sources - Red
bgcolor: combineRgb(255, 0, 0)

// Preview sources - Green
bgcolor: combineRgb(0, 204, 0)

// AUX sources - Blue
bgcolor: combineRgb(0, 51, 204)

// Keys/DSK - Yellow
bgcolor: combineRgb(255, 255, 0)
```

### Unicode Icons in Button Text

**Reference**: [Presets Guide - Unicode Icons](https://github.com/bitfocus/companion-module-base/wiki/Presets#design-recommendations)

Use Unicode icons to enhance button appearance:

```javascript
// ✅ PLAYBACK CONTROLS
text: '⏵ PLAY'      // Play
text: '⏹ STOP'      // Stop
text: '⏸ PAUSE'     // Pause
text: '⏮ PREV'      // Previous
text: '⏭ NEXT'      // Next

// ✅ NAVIGATION ARROWS
text: '⬆️ UP'       // Up arrow
text: '➡️ NEXT'     // Right arrow
text: '⬇️ DOWN'     // Down arrow
text: '⬅️ BACK'     // Left arrow

// ✅ FUNCTION SYMBOLS
text: '🔁 LOOP'     // Loop/Repeat
text: '❄️ FREEZE'   // Freeze frame
text: '🔇 MUTE'     // Mute
text: '😱 PANIC'    // Emergency/Panic

// ✅ MULTI-LINE WITH ICONS
text: 'PLAY\\n⏵'    // Text on top, icon below
text: '⏹\\nSTOP'    // Icon on top, text below
```

### Text Color Standards

```javascript
// Default text - White
color: combineRgb(255, 255, 255)

// On yellow background - Black
color: combineRgb(0, 0, 0)
```

### Always Use combineRgb()

**NEVER** use hardcoded color numbers:

```javascript
// ❌ BAD
bgcolor: 16711680

// ✅ GOOD
bgcolor: combineRgb(255, 0, 0)
```

---

## Important Constraints and Limitations

### ⚠️ Actions in Presets

**Reference**: [Presets Guide - Important Constraints](https://github.com/bitfocus/companion-module-base/wiki/Presets#important-constraints)

**CRITICAL**: Presets can only use actions defined by your module. Internal Companion actions are NOT available.

```javascript
// ✅ VALID - Module-defined action
steps: [{
    down: [{
        actionId: 'select_camera',  // Defined in your module's actions
        options: { num: 1 }
    }],
    up: []
}]

// ❌ INVALID - Internal Companion actions not available in presets
steps: [{
    down: [{
        actionId: 'internal:trigger_bank',  // ❌ Won't work
        options: { bank: 1 }
    }],
    up: []
}]
```

### Variable Support in Style Properties

**Reference**: [CompanionButtonStyleProps](https://bitfocus.github.io/companion-module-base/interfaces/CompanionButtonStyleProps.html)

Preset button text supports Companion variable interpolation:

```javascript
style: {
    text: 'Camera $(generic-module:selected_camera)',  // ✅ Variables supported
    size: 'auto',
    color: combineRgb(255, 255, 255),
    bgcolor: combineRgb(0, 0, 0)
}
```

### Preview Style

Use `previewStyle` to show a different appearance in the Companion GUI preset browser:

```javascript
presets['camera_select'] = {
    type: 'button',
    category: 'Cameras',
    name: 'Select Camera',
    style: {
        text: 'CAM $(this:camera_num)',  // Actual button will show variable
        size: 'auto',
        color: combineRgb(255, 255, 255),
        bgcolor: combineRgb(255, 0, 0)
    },
    previewStyle: {  // ⚠️ OPTIONAL - Shows in preset browser
        text: 'CAM 1',  // Preview shows static text
        size: 'auto',
        color: combineRgb(255, 255, 255),
        bgcolor: combineRgb(255, 0, 0)
    },
    steps: [{ down: [], up: [] }],
    feedbacks: []
}
```

---

## Rule 5: Code Structure

### updatePresets() Method

Structure presets method consistently:

```javascript
updatePresets() {
    const presets = {}
    
    // Section 1: Cameras
    presets['header_cameras'] = { type: 'text', ... }
    for (let i = 1; i <= 10; i++) {
        presets[`cam_${i}`] = { ... }
    }
    
    // Section 2: Audio
    presets['header_audio'] = { type: 'text', ... }
    for (let i = 1; i <= 8; i++) {
        presets[`audio_ch_${i}`] = { ... }
    }
    
    // Section 3: Transport controls
    presets['control_play'] = { ... }
    presets['control_stop'] = { ... }
    
    // Register all presets at end
    this.setPresetDefinitions(presets)
}
```

### When to Extract to Separate File

Consider extracting presets to separate file when:

- More than 20 preset definitions
- Module has complex preset logic
- Multiple preset categories with different patterns
- File size exceeds 500 lines

**Extraction pattern:**

```javascript
// presets.js
module.exports = function (self) {
    const presets = {}
    
    // ... preset definitions ...
    
    return presets
}

// main.js
const getPresets = require('./presets')

updatePresets() {
    const presets = getPresets(this)
    this.setPresetDefinitions(presets)
}
```

---

## Rule 6: Preset Type Selection

### Use type: 'button' for

- Clickable controls that trigger actions
- Any preset that needs to DO something
- Presets with visual feedback (state-aware)
- Interactive controls

### Use type: 'text' for

- Section headers
- Visual organization
- Non-interactive labels
- Category breaks

### Required Properties Checklist

**Button presets require:**

- `type: 'button'`
- `category: string`
- `name: string`
- `style: { ... }` with at least `text` property
- `steps: [{ down: [...], up: [] }]`
- `feedbacks: []` (can be empty array)

**Text presets require:**

- `type: 'text'`
- `category: string`
- `name: string`
- `text: string`

---

## Rule 7: Self-Checking Guidelines

### Before Creating Presets

1. ✅ Check `PRESETS_GUIDE.md` for similar examples
2. ✅ Identify if pattern is repetitive (use loops)
3. ✅ Verify available `actionId` values in `actionId.js`
4. ✅ Confirm category path uses forward slashes
5. ✅ Plan color scheme based on function type

### After Creating Presets

1. ✅ Verify all `actionId` references exist in `actionId.js`
2. ✅ Verify all `feedbackId` references exist in `feedbacks.js`
3. ✅ Confirm all colors use `combineRgb(r, g, b)`
4. ✅ Check headers are included for organization
5. ✅ Ensure loops are used for repetitive patterns
6. ✅ Validate category paths use forward slashes

### Common Issues Checklist

- [ ] Preset not appearing? → Check category format
- [ ] Action not firing? → Verify actionId exists
- [ ] Wrong colors? → Use combineRgb() function
- [ ] Text not showing? → Check escape sequences (\\n)
- [ ] Poor organization? → Add text headers

---

## Rule 8: Multi-Line Text Best Practices

### Line Break Usage

Use `\\n` to create multi-line button text:

```javascript
text: `CAM ${i}`              // Single line
text: `PGM\\nCAM ${i}`        // Two lines
text: `CAM ${i}\\nHARD`       // Number + type
text: `AUX ${i}\\nSRC ${j}`   // Multiple variables
```

### Text Alignment

Coordinate alignment with multi-line text:

```javascript
// For multi-line with content at top and bottom
alignment: 'center:top'

// For single-line centered
alignment: 'center:center'

// For left-aligned lists
alignment: 'left:center'
```

### Icon Alignment

Position icons separately from text:

```javascript
pngalignment: 'center:bottom'  // Icon at bottom
pngalignment: 'center:center'  // Icon centered
```

---

## Rule 9: Action and Feedback Configuration

### Action Options Pattern

Pass differentiating data through options:

```javascript
steps: [{
    down: [{
        actionId: 'select_source',
        options: {
            num: i,              // Loop variable
            type: 'camera',      // Static type
            bus: 'program'       // Static bus
        }
    }],
    up: []
}]
```

### Empty Arrays for Unused Properties

Be explicit about unused properties:

```javascript
steps: [{ down: [...], up: [] }]  // No action on button release
feedbacks: []                      // No dynamic feedback
```

### Feedback Configuration

Add feedbacks only when preset should reflect state:

```javascript
feedbacks: [{
    feedbackId: 'source_active',
    options: { num: i },
    style: {
        bgcolor: combineRgb(208, 179, 75),  // Gold when active
        color: combineRgb(0, 0, 0)
    },
    isInverted: false
}]
```

---

## Quick Reference: Preset Generation Template

```javascript
// Header
presets['header_category'] = {
    type: 'text',
    category: 'Category/Path',
    name: 'Header Name',
    text: 'Display Text'
}

// Loop-generated buttons
for (let i = 1; i <= COUNT; i++) {
    presets[`category_${i}`] = {
        type: 'button',
        category: 'Category/Path',
        name: `${i}. Item ${i}`,
        style: {
            text: `LABEL ${i}`,
            size: 'auto',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 0)
        },
        steps: [{
            down: [{
                actionId: 'action_name',
                options: { num: i }
            }],
            up: []
        }],
        feedbacks: []
    }
}
```

---

## Summary: Key Principles

1. **DRY (Don't Repeat Yourself)**: Use loops for repetitive presets
2. **Documentation First**: Check official Companion docs before implementing
3. **Required Properties**: Always include type, category, name, style, steps, feedbacks
4. **Organization**: Always include headers for grouped presets
5. **Consistency**: Follow naming conventions for IDs, names, and text
6. **Clarity**: Use descriptive category paths with forward slashes
7. **Color Standards**: Use official Companion color palette (Red=Stop, Green=Go, Yellow=Pause, etc.)
8. **Unicode Icons**: Enhance buttons with standard Unicode symbols (⏵⏹⏸🔇)
9. **Constraints**: Only use module-defined actions (internal actions not available)
10. **Variables**: Support variable interpolation in button text
11. **Advanced Features**: Use rotary actions, step control, delays, and hold actions when needed
12. **Validation**: Reference TypeScript interfaces for complete property lists
13. **Efficiency**: Target 50 lines instead of 350 for repetitive patterns

---

## When in Doubt

1. **Check Official Documentation**:
   - [Presets Guide](https://github.com/bitfocus/companion-module-base/wiki/Presets)
   - [CompanionButtonPresetDefinition](https://bitfocus.github.io/companion-module-base/interfaces/CompanionButtonPresetDefinition.html)
   - [CompanionButtonStyleProps](https://bitfocus.github.io/companion-module-base/interfaces/CompanionButtonStyleProps.html)

2. **Review TypeScript Interfaces**: Check property requirements and optional fields

3. **Check existing code**: Look at [actions.js](application/actions.js) and [feedbacks.js](application/feedbacks.js)

4. **Use Official Color Palette**: RED (255,0,0), GREEN (0,204,0), YELLOW (255,255,0), BLUE (0,51,204), PURPLE (255,0,255)

5. **Remember Constraints**:
   - Only module-defined actions work in presets
   - Internal Companion actions are NOT available
   - All colors must use `combineRgb(r, g, b)`

6. **Follow the patterns**: Use the templates provided in this file

7. **Ask for clarification**: If requirements are ambiguous
