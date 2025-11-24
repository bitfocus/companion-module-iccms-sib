# Bitfocus Companion Module Development Rules

## Documentation References

### When Uncertain About Preset Creation

- **Primary Reference**: Always check `PRESETS_GUIDE.md` in project root first
- **Official Companion Docs**: <https://github.com/bitfocus/companion-module-base>
- **Companion Wiki**: <https://github.com/bitfocus/companion/wiki>
- **Module SDK API**: <https://github.com/bitfocus/companion-module-base/wiki>

### For Specific Topics

- **Preset Patterns**: See `PRESETS_GUIDE.md` sections on "Three Preset Creation Patterns" and "Pattern 3: Dynamic Loop-Generated Presets"
- **Preset Types**: Reference "Preset Types" section (button vs text)
- **Actions**: Check `actionId.js` for valid `actionId` values
- **Feedbacks**: Check `feedbacks.js` for valid `feedbackId` values
- **Colors**: Always use `combineRgb(r, g, b)` from `@companion-module/base`

### Troubleshooting

- **Preset not appearing** → Check category path format (use forward slashes: `'Category/Subcategory'`)
- **Action not triggering** → Verify `actionId` matches a valid action in `actionId.js`
- **Feedback not working** → Ensure `feedbackId` matches a valid feedback in `feedbacks.js`
- **Colors incorrect** → Confirm using `combineRgb(r, g, b)` function
- **Button text not displaying** → Check escape sequences (`\\n` for line breaks in JavaScript/TypeScript)

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

### Function-Based Colors

Use consistent colors based on function type:

```javascript
// Camera sources - Red
bgcolor: combineRgb(255, 0, 0)

// Preview sources - Green
bgcolor: combineRgb(0, 204, 0)

// AUX sources - Blue
bgcolor: combineRgb(0, 51, 204)

// Keys/DSK - Yellow
bgcolor: combineRgb(255, 255, 0)

// Audio mute - Red
bgcolor: combineRgb(255, 0, 0)

// Audio unmute - Green
bgcolor: combineRgb(0, 204, 0)

// Transport play - Green
bgcolor: combineRgb(0, 204, 0)

// Transport stop - Red
bgcolor: combineRgb(255, 0, 0)

// Transport pause - Yellow
bgcolor: combineRgb(255, 255, 0)

// Neutral/default - Black
bgcolor: combineRgb(0, 0, 0)

// Active feedback state - Gold
bgcolor: combineRgb(208, 179, 75)
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
2. **Organization**: Always include headers for grouped presets
3. **Consistency**: Follow naming conventions for IDs, names, and text
4. **Clarity**: Use descriptive category paths with forward slashes
5. **Standards**: Apply function-based color coding
6. **Validation**: Reference documentation when uncertain
7. **Efficiency**: Target 50 lines instead of 350 for repetitive patterns
8. **Best Practices**: Check PRESETS_GUIDE.md before implementing

---

## When in Doubt

1. **Read PRESETS_GUIDE.md first** - It contains comprehensive examples
2. **Check existing code** - Look at `actions.js` and `feedbacks.js`
3. **Reference official docs** - Companion GitHub repositories
4. **Follow the patterns** - Use the templates provided in this file
5. **Ask for clarification** - If requirements are ambiguous
