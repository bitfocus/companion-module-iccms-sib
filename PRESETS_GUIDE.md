# Bitfocus Companion Presets Creation Guide

## Documentation References

### Official Companion Documentation

- **Companion Module Development**: [https://github.com/bitfocus/companion-module-base](https://github.com/bitfocus/companion-module-base)
- **Companion Wiki**: [https://github.com/bitfocus/companion/wiki](https://github.com/bitfocus/companion/wiki)
- **Module SDK API**: [https://github.com/bitfocus/companion-module-base/wiki](https://github.com/bitfocus/companion-module-base/wiki)

### Troubleshooting Guide

- **Preset not appearing**: Check category path format (use forward slashes: `'Category/Subcategory'`)
- **Action not triggering**: Verify `actionId` matches a valid action in `actions.js`
- **Feedback not working**: Ensure `feedbackId` matches a valid feedback in `feedbacks.js`
- **Colors incorrect**: Always use `combineRgb(r, g, b)` function from `@companion-module/base`
- **Button text not displaying**: Check for proper escape sequences (`\\n` for line breaks in JavaScript)

### Related Documentation in This Project

- This file (`PRESETS_GUIDE.md`) - Comprehensive preset creation patterns
- `actions.js` - Available action definitions
- `feedbacks.js` - Available feedback definitions
- `main.js` - Module integration example

---

## Overview

Presets in Bitfocus Companion are pre-configured button controls that users can drag onto their control surface. They combine visual styling, actions, and optional dynamic feedback to create reusable controls.

---

## Core Structure

### Main Function

All presets are defined in a dedicated `src/presets.ts` file using TypeScript:

```typescript
export function UpdatePresetDefinitions(self: ModuleInstance): void {
 const presets: CompanionPresetDefinitions = {
  // preset definitions here
 }

 self.setPresetDefinitions(presets)
}
```

### Integration with Module Lifecycle

```typescript
// In main.ts (or main.js for JavaScript projects)
class ModuleInstance extends InstanceBase<ModuleConfig> {
 async init(config: ModuleConfig): Promise<void> {
  // ... initialization code ...
  this.updateActions()
  this.updateFeedbacks()
  this.updateVariableDefinitions()
  this.updatePresetDefinitions()  // Called during init
 }

 updatePresetDefinitions(): void {
  UpdatePresetDefinitions(this)  // Delegates to presets.ts/presets.js
 }
}
```

---

## Preset Types

Bitfocus Companion presets use the `type` property to define what kind of preset it is. Understanding the different type values is fundamental to creating effective presets.

### Type Values Overview

| Type | Purpose | Interactive | Use Case |
|------|---------|-------------|----------|
| `'button'` | Clickable preset that triggers actions | Yes | Controls, switches, selections |
| `'text'` | Non-interactive label/header | No | Organization, section breaks |

---

### 1. `type: 'button'` - Interactive Action Buttons

Button presets are clickable controls that trigger actions when pressed and can show dynamic visual feedback based on system state.

```typescript
presetKey: {
 type: 'button',                    // Required: marks as interactive button
 category: 'Category Name',         // Groups presets in UI
 name: 'Preset Display Name',       // User-facing name
 style: {                           // Visual appearance
  text: 'Button Text',
  size: '14',                    // Font size or 'auto'
  color: combineRgb(255, 255, 255),     // Text color
  bgcolor: combineRgb(0, 0, 0),         // Background color
  alignment: 'center:top',              // Text alignment
  pngalignment: 'center:bottom',        // Icon alignment
  png64: 'data:image/png;base64,...'    // Base64 icon
 },
 steps: [                           // Actions to execute (REQUIRED for buttons)
  {
   down: [                    // On button press
    {
     actionId: 'action_name',
     options: {
      option1: 'value',
      // action-specific options
     },
    },
   ],
   up: [],                    // On button release
  },
 ],
 feedbacks: [                       // Optional visual feedback based on state
  {
   feedbackId: 'feedback_name',
   options: {},
   style: {
    bgcolor: combineRgb(208, 179, 75),
    color: combineRgb(0, 0, 0),
   },
   isInverted: false,
  },
 ],
}
```

**Characteristics of Button Presets:**

- **Required properties**: `type`, `category`, `name`, `style`, `steps`
- **Can be pressed**: Users click/tap them to execute actions
- **Has visual styling**: Text, colors, icons, alignment
- **Can execute multiple actions**: Each button can have many actions in the `down` array
- **Can have feedback**: Visual appearance changes based on system state (optional)
- **Stateful**: Can reflect current status through feedbacks (optional)

**Real-World Examples:**

```javascript
// Simple camera selection button
presets['pgm_source_cam1'] = {
 type: 'button',
 category: 'Switcher/Program/Sources/Cameras',
 name: '1. Camera 1',
 style: {
  text: 'PGM\\nCAM 1',
  size: 'auto',
  color: combineRgb(255, 255, 255),
  bgcolor: combineRgb(255, 0, 0),
 },
 steps: [
  {
   down: [
    {
     actionId: 'sample_action',
     options: { num: 1 },
    },
   ],
   up: [],
  },
 ],
 feedbacks: [],
}

// Status-aware button with feedback
presets['toggle_rehearsal'] = {
 type: 'button',
 category: 'Control/Playback',
 name: 'Rehearsal Mode',
 style: {
  text: 'REHEARSAL',
  size: '14',
  color: combineRgb(255, 255, 255),
  bgcolor: combineRgb(0, 0, 0),
 },
 steps: [
  {
   down: [
    {
     actionId: 'set_rehearsal_mode',
     options: { enable: true },
    },
   ],
   up: [],
  },
 ],
 feedbacks: [
  {
   feedbackId: 'rehearsal_active',
   options: {},
   style: {
    bgcolor: combineRgb(255, 255, 0),  // Turns yellow when active
    color: combineRgb(0, 0, 0),
   },
  },
 ],
}
```

---

### 2. `type: 'text'` - Non-Interactive Headers/Labels

Text presets are non-interactive labels used to organize and visually break up sections in the preset browser. They do NOT execute actions when clicked.

```typescript
presetKey: {
 type: 'text',                      // Required: marks as non-interactive text
 category: 'Category Name',         // Which category in the preset list
 name: 'Header Display Name',       // User-facing name for sorting
 text: 'Header Display Text',       // The actual text shown to user
}
```

**Characteristics of Text Presets:**

- **Required properties**: `type`, `category`, `name`, `text`
- **Non-clickable**: Cannot be pressed or triggered
- **No styling**: Cannot change colors, fonts, or add icons
- **No actions**: No `steps` property (would be ignored)
- **No feedbacks**: Cannot have dynamic visual feedback
- **Simple structure**: Minimal required properties
- **Organization tool**: Groups related buttons visually

**Purpose of Text/Header Presets:**

- Organize related buttons into visual groups
- Create section breaks in the preset browser
- Help users find buttons quickly by category
- Reduce clutter by grouping similar presets
- Improve UX of the preset list

**Real-World Examples:**

```javascript
// Simple section header
presets['header_cameras'] = {
 type: 'text',
 category: 'Switcher/Program/Sources/Cameras',
 name: 'Program Cameras',              // Numbered for sorting
 text: 'Program Camera Sources',       // What user sees
}

// Another section header
presets['header_media'] = {
 type: 'text',
 category: 'Switcher/Program/Sources/Media',
 name: 'Media Players',
 text: 'Media Playback Sources',
}

// Continuation header (breaks up long lists)
presets['header_cameras_cont'] = {
 type: 'text',
 category: 'Switcher/Program/Sources/Cameras',
 name: 'Additional Cameras',           // Different name for sorting order
 text: 'Extra Camera Sources (7-12)',
}

// Status/info header
presets['header_status'] = {
 type: 'text',
 category: 'System/Status',
 name: 'System Status',
 text: '━━━ System Information ━━━',  // Can use special characters
}
```

---

### Key Differences: Button vs Text

| Feature | Button | Text |
|---------|--------|------|
| **Type Value** | `'button'` | `'text'` |
| **Clickable** | ✅ Yes | ❌ No |
| **Has `steps`** | ✅ Required | ❌ Not used |
| **Has `style`** | ✅ Required | ❌ Not used |
| **Has `feedbacks`** | ✅ Optional | ❌ Not supported |
| **Has `text` property** | (In `style`) | ✅ Required |
| **Triggers actions** | ✅ Yes | ❌ No |
| **Shows status** | ✅ Via feedbacks | ❌ Static only |
| **Min. properties** | 5 | 4 |

---

### Type Naming Convention

Use clear naming to distinguish types in your code:

```javascript
// Headers (text type) - use 'header' prefix
presets['header_cameras'] = { type: 'text', ... }
presets['header_audio'] = { type: 'text', ... }

// Buttons - use descriptive names
presets['pgm_source_cam1'] = { type: 'button', ... }
presets['audio_mic1_mute'] = { type: 'button', ... }
presets['control_play'] = { type: 'button', ... }
```

This makes it instantly clear what type of preset you're working with when reading the code.

---

## Button Preset Properties

### Style Properties

| Property | Type | Purpose | Example |
|----------|------|---------|---------|
| `text` | string | Button label (supports `\n` for line breaks) | `'F12'` or `'KAM 1\nHARD'` |
| `size` | string | Font size (number or 'auto') | `'14'` or `'16'` |
| `color` | number | Text color from `combineRgb(r, g, b)` | `combineRgb(255, 255, 255)` |
| `bgcolor` | number | Background color from `combineRgb(r, g, b)` | `combineRgb(0, 0, 0)` |
| `alignment` | string | Text position | `'center:top'`, `'center:center'`, `'left:center'` |
| `pngalignment` | string | Icon position | `'center:bottom'`, `'center:center'` |
| `png64` | string | Base64-encoded PNG image | `'data:image/png;base64,iVBORw0...'` |

### Step Properties

**Steps** define what happens when the button is pressed/released:

```typescript
steps: [
 {
  down: [                        // Actions on button press (required)
   {
    actionId: 'action_name',
    options: {
     // Action-specific configuration
    },
   },
  ],
  up: [],                        // Actions on button release (use [] for none)
 },
]
```

- `actionId`: Must reference a valid action defined in `actions.ts`
- `options`: Configuration passed to the action (specific to each action)

### Feedback Properties

**Feedbacks** make buttons respond visually to system state:

```typescript
feedbacks: [
 {
  feedbackId: 'feedback_name',   // Must reference valid feedback
  options: {},                   // Feedback-specific config
  style: {                       // Visual changes when feedback is active
   bgcolor: combineRgb(208, 179, 75),
   color: combineRgb(0, 0, 0),
  },
  isInverted: false,             // Invert feedback condition (optional)
 },
]
```

---

## Three Preset Creation Patterns

### Pattern 1: Static Presets

Single, unique preset definitions for specific functions.

**Best for:** One-off buttons that don't need repetition

```typescript
start_continue: {
 type: 'button',
 category: 'Rundown',
 name: 'Start/Continue the rundown',
 style: {
  text: 'F12',
  size: '14',
  color: combineRgb(255, 255, 255),
  bgcolor: combineRgb(0, 0, 0),
 },
 steps: [
  {
   down: [
    {
     actionId: 'start_continue',
     options: {
      option: 'Default',
     },
    },
   ],
   up: [],
  },
 ],
 feedbacks: [],
}
```

### Pattern 2: Presets with Feedback (State-Aware)

Buttons that change appearance based on system state.

**Best for:** Controls that need to show current status

```typescript
toggle_rehearsal_mode: {
 type: 'button',
 category: 'Rundown',
 name: 'Toggle Rehearsal Mode',
 style: {
  text: 'Rehearsal',
  size: '14',
  color: combineRgb(255, 255, 255),
  bgcolor: combineRgb(0, 0, 0),
 },
 steps: [
  {
   down: [
    {
     actionId: 'rehearsal_mode',
     options: {},
    },
   ],
   up: [],
  },
 ],
 feedbacks: [
  {
   feedbackId: 'RehearsalStatus',
   options: {},
   style: {
    bgcolor: combineRgb(208, 179, 75),  // Gold when active
    color: combineRgb(0, 0, 0),
   },
  },
 ],
}
```

### Pattern 3: Dynamic Loop-Generated Presets

Multiple similar presets created programmatically.

**Best for:** Repetitive controls (cameras, sources, channels, etc.)

```typescript
// Add a header for organization
presets['header_hard_cameras'] = {
 category: 'Camera',
 name: 'Hard Cameras',
 type: 'text',
 text: 'Hard Camera Presets',
}

// Generate 10 similar presets in a loop
for (let i = 1; i <= 10; i++) {
 presets[`cam_hard_${i}`] = {
  type: 'button',
  category: 'Camera',
  name: `Camera ${i}`,
  style: {
   text: `KAM ${i}\nHARD`,
   alignment: 'center:top',
   size: 16,
   color: combineRgb(0, 0, 0),
   bgcolor: combineRgb(128, 255, 128),  // Green
   pngalignment: 'center:bottom',
   png64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAhCAYAAABX5MJv...',
  },
  steps: [
   {
    down: [
     {
      actionId: 'template',
      options: {
       type: 'Camera',
       variant: `${i}HARD`,
       bus: 'Program',
      },
     },
    ],
    up: [],
   },
  ],
  feedbacks: [],
 }
}
```

---

## Real-World Example: Hard vs Soft Cameras

A common pattern in broadcast control modules is to create two nearly identical preset groups that demonstrate how the loop pattern scales with minor variations.

### Hard Cameras

```typescript
// Header
presets['header1'] = {
 category: 'Camera',
 name: 'Hard Cameras',
 type: 'text',
 text: 'Hard Camera Presets',
}

// 10 buttons
for (let i = 1; i <= 10; i++) {
 presets[`cam_hard_${i}`] = {
  type: 'button',
  category: 'Camera',
  name: `Camera ${i}`,
  style: {
   text: `KAM ${i}\nHARD`,
   alignment: 'center:top',
   size: 16,
   color: combineRgb(0, 0, 0),
   bgcolor: combineRgb(128, 255, 128),  // Light green
   pngalignment: 'center:bottom',
   png64: 'data:image/png;base64,...',
  },
  steps: [{
   down: [{
    actionId: 'template',
    options: {
     type: 'Camera',
     variant: `${i}HARD`,    // KEY DIFFERENCE
     bus: 'Program',
    },
   }],
   up: [],
  }],
  feedbacks: [],
 }
}
```

### Soft Cameras

```typescript
// Header
presets['header2'] = {
 category: 'Camera',
 name: 'Soft Cameras',
 type: 'text',
 text: 'Soft Camera Presets',
}

// 10 buttons
for (let i = 1; i <= 10; i++) {
 presets[`cam_soft_${i}`] = {
  type: 'button',
  category: 'Camera',
  name: `Camera ${i}`,
  style: {
   text: `KAM ${i}\nSOFT`,
   alignment: 'center:top',
   size: 16,
   color: combineRgb(0, 0, 0),
   bgcolor: combineRgb(128, 255, 128),  // Light green
   pngalignment: 'center:bottom',
   png64: 'data:image/png;base64,...',
  },
  steps: [{
   down: [{
    actionId: 'template',
    options: {
     type: 'Camera',
     variant: `${i}SOFT`,     // KEY DIFFERENCE
     bus: 'Program',
    },
   }],
   up: [],
  }],
  feedbacks: [],
 }
}
```

**Key Differences:**

- Preset IDs: `cam_hard_${i}` vs `cam_soft_${i}`
- Button text: `HARD` vs `SOFT`
- Variant parameter: `${i}HARD` vs `${i}SOFT`
- Everything else is identical (styling, icon, action type, bus)

**Result:** 20 total buttons (10 hard + 10 soft) from minimal code

---

## Best Practices

### 1. Color Coding by Function

Use consistent colors for different preset types:

```typescript
// Camera buttons - green
bgcolor: combineRgb(128, 255, 128)

// External sources - red
bgcolor: combineRgb(155, 0, 0)

// Default/neutral - black
bgcolor: combineRgb(0, 0, 0)

// Active/feedback state - gold
bgcolor: combineRgb(208, 179, 75)
```

### 2. Organize with Headers

Group related presets using text headers:

```typescript
presets['header_cameras'] = {
 category: 'Camera',
 name: 'Cameras',
 type: 'text',
 text: 'Camera Presets',
}

presets['header_external'] = {
 category: 'External',
 name: 'External Sources',
 type: 'text',
 text: 'External Source Presets',
}
```

### 3. Descriptive Naming

Use clear, consistent preset IDs:

```typescript
// Good:
presets['cam_hard_1']           // Type_variant_number
presets['external_source_1']    // Type_description_number
presets['status_connected']     // Status_state

// Less clear:
presets['button_1']
presets['preset_a']
presets['thing_1']
```

### 4. Multi-Line Button Text

Use `\n` for line breaks to fit more info on small buttons:

```typescript
text: `KAM ${i}\nHARD`     // Displays as two lines
text: `Camera\n${i}`       // Another format
```

### 5. Text Alignment for Multi-Line Text

When using line breaks, position text carefully:

```typescript
alignment: 'center:top'    // Number at top, text at bottom
alignment: 'center:center' // Balanced for single line
```

### 6. Empty Arrays for Unused Properties

Be explicit about unused properties:

```typescript
steps: [{ down: [...], up: [] }]  // No action on release
feedbacks: []                      // No dynamic feedback
```

### 7. DRY Principle (Don't Repeat Yourself)

Use loops instead of copying/pasting:

```typescript
// Good: 10 cameras in ~15 lines
for (let i = 1; i <= 10; i++) {
 presets[`cam_${i}`] = { ... }
}

// Bad: 150+ lines for 10 nearly identical presets
presets['cam_1'] = { ... }
presets['cam_2'] = { ... }
// ... repeat 8 more times
```

---

## Complete Preset Properties Reference

### All Button Preset Properties

```typescript
interface ButtonPreset {
 type: 'button'                     // Required
 category: string                   // Required - organization
 name: string                       // Required - display name
 style: {
  text: string                   // Optional but recommended
  size: string                   // Optional
  color: number                  // Optional (text color)
  bgcolor: number                // Optional (background)
  alignment?: string             // Optional
  pngalignment?: string          // Optional (for icons)
  png64?: string                 // Optional (base64 icon)
 }
 steps: Array<{                     // Required
  down: Array<ActionDefinition> // Required
  up: Array<ActionDefinition>   // Required
 }>
 feedbacks: Array<{                 // Required (can be empty)
  feedbackId: string
  options: any
  style: any
  isInverted?: boolean
 }>
}
```

### All Text Preset Properties

```typescript
interface TextPreset {
 type: 'text'                       // Required
 category: string                   // Required
 name: string                       // Required
 text: string                       // Required - display text
}
```

---

## Preset Categories

Example categories commonly used in broadcast control modules (create your own as needed):

- `'Camera'` - Camera selection presets
- `'Switcher/Program'` - Program bus control
- `'Switcher/Preview'` - Preview bus control
- `'Audio/Inputs'` - Audio input controls
- `'Audio/Outputs'` - Audio output controls
- `'Control/Transport'` - Playback transport controls
- `'Status'` - Status indicators
- `'Recall'` - Memory recall functions

**Category Naming Best Practices:**

- Use forward slashes (`/`) for hierarchical organization
- Keep category names clear and descriptive
- Group related functionality together
- Consider operator workflows when organizing

---

## Common Patterns Summary

| Scenario | Pattern | Example |
|----------|---------|---------|
| Single control button | Static | `start_continue`, `stop` |
| Button with status feedback | With Feedback | `rehearsal_mode`, `automation_status` |
| Multiple similar buttons | Loop Generated | Camera 1-10, Sources 1-8 |
| Section organization | Text Header | "Camera Presets", "External Sources" |
| Grouped controls | Header + Loop | Header + 10 camera buttons |

---

## Integration Checklist

When implementing presets in your module:

- [ ] Create `src/presets.ts` file
- [ ] Export `UpdatePresetDefinitions` function
- [ ] Call `self.setPresetDefinitions(presets)` at end
- [ ] Reference only valid `actionId` values from `actions.ts`
- [ ] Reference only valid `feedbackId` values from `feedbacks.ts`
- [ ] Use `combineRgb()` for all color values
- [ ] Add text headers for organization
- [ ] Use loops for repetitive presets
- [ ] Test that presets appear in Companion UI
- [ ] Verify actions are triggered correctly
- [ ] Confirm feedbacks update button appearance

---

---

## Real-World Implementation: 12 Camera Buttons with Headers

This section documents how the camera preset system was implemented in practice, showing how to scale from a basic preset to a full organizational structure.

### Step 1: Create the First Header

Start by adding a header to organize the first group of cameras:

```javascript
presets['header_pgm_cameras'] = {
 category: 'Switcher/Program/Sources/Cameras',
 name: 'Program Cameras',
 type: 'text',
 text: 'Program Camera Sources',
}
```

**Key points:**

- `type: 'text'` marks this as a non-interactive header
- `category` places it in the preset browser
- `name` is the sortable identifier (useful for ordering)
- `text` is what users see

### Step 2: Add First Set of Buttons (1-6)

Create the initial preset buttons. For cameras 1 and 2, define them individually. Then, for cameras 3-6, use the same pattern:

```javascript
presets['pgm_source_cam3'] = {
 type: 'button',
 category: 'Switcher/Program/Sources/Cameras',
 name: '3. Camera 3',                    // Numbered for sorting
 style: {
  text: 'PGM\\nCAM 3',              // Multi-line with \n
  size: 'auto',
  color: combineRgb(255, 255, 255), // White text
  bgcolor: combineRgb(255, 0, 0),   // Red background
 },
 steps: [
  {
   down: [
    {
     actionId: 'sample_action',
     options: {
      num: 3,                // Sequential numbering
     },
    },
   ],
   up: [],
  },
 ],
 feedbacks: [],
}
```

**Pattern to follow:**

- **Preset ID**: `pgm_source_cam${number}` - consistent naming
- **Name**: Start with number for automatic sorting in preset list
- **Text**: Use `\\n` for line breaks to fit more info
- **Action options**: Pass the camera number to differentiate behavior
- **Sequential IDs**: Easy to find and modify later

### Step 3: Add Second Header for Continuation

After the first 6 cameras, add a visual break with a second header:

```javascript
presets['header_pgm_cameras_2'] = {
 category: 'Switcher/Program/Sources/Cameras',
 name: 'Program Cameras (Continued)',   // Different name for sorting
 type: 'text',
 text: 'Additional Camera Sources',
}
```

**Why a second header?**

- Breaks up large lists visually in the preset browser
- Helps users understand the preset organization
- Can group related functionality (e.g., "Hardware Cameras" vs "Virtual Cameras")

### Step 4: Add Second Set of Buttons (7-12)

Repeat the button pattern for cameras 7-12 with the same structure:

```javascript
presets['pgm_source_cam7'] = {
 type: 'button',
 category: 'Switcher/Program/Sources/Cameras',
 name: '7. Camera 7',
 style: {
  text: 'PGM\\nCAM 7',
  size: 'auto',
  color: combineRgb(255, 255, 255),
  bgcolor: combineRgb(255, 0, 0),
 },
 steps: [
  {
   down: [
    {
     actionId: 'sample_action',
     options: {
      num: 7,
     },
    },
   ],
   up: [],
  },
 ],
 feedbacks: [],
}

// ... repeat for cameras 8-12 with same pattern
```

### Implementation Pattern Summary

```
presets['header_pgm_cameras']          // Header 1
  ↓
presets['pgm_source_cam1-6']           // Buttons 1-6
  ↓
presets['header_pgm_cameras_2']        // Header 2
  ↓
presets['pgm_source_cam7-12']          // Buttons 7-12
  ↓
this.setPresetDefinitions(presets)     // Register all at end
```

### Code Efficiency Analysis

**Total code for 12 cameras + 2 headers:**

- ~350 lines of JavaScript
- Highly repetitive with only 3 changes per button:
  - Camera number in ID: `cam1`, `cam2`, etc.
  - Camera number in text: `CAM 1`, `CAM 2`, etc.
  - Camera number in action options: `num: 1`, `num: 2`, etc.

**How to optimize this further:**

Use a loop to generate cameras programmatically:

```javascript
// Header
presets['header_pgm_cameras'] = {
 category: 'Switcher/Program/Sources/Cameras',
 name: 'Program Cameras',
 type: 'text',
 text: 'Program Camera Sources',
}

// Generate cameras 1-6 dynamically
for (let i = 1; i <= 6; i++) {
 presets[`pgm_source_cam${i}`] = {
  type: 'button',
  category: 'Switcher/Program/Sources/Cameras',
  name: `${i}. Camera ${i}`,
  style: {
   text: `PGM\\nCAM ${i}`,
   size: 'auto',
   color: combineRgb(255, 255, 255),
   bgcolor: combineRgb(255, 0, 0),
  },
  steps: [
   {
    down: [
     {
      actionId: 'sample_action',
      options: {
       num: i,
      },
     },
    ],
    up: [],
   },
  ],
  feedbacks: [],
 }
}

// Second header
presets['header_pgm_cameras_2'] = {
 category: 'Switcher/Program/Sources/Cameras',
 name: 'Program Cameras (Continued)',
 type: 'text',
 text: 'Additional Camera Sources',
}

// Generate cameras 7-12 dynamically
for (let i = 7; i <= 12; i++) {
 presets[`pgm_source_cam${i}`] = {
  type: 'button',
  category: 'Switcher/Program/Sources/Cameras',
  name: `${i}. Camera ${i}`,
  style: {
   text: `PGM\\nCAM ${i}`,
   size: 'auto',
   color: combineRgb(255, 255, 255),
   bgcolor: combineRgb(255, 0, 0),
  },
  steps: [
   {
    down: [
     {
      actionId: 'sample_action',
      options: {
       num: i,
      },
     },
    ],
    up: [],
   },
  ],
  feedbacks: [],
 }
}
```

**Optimization Result:**

- Reduces 350 lines → ~50 lines
- Easy to scale to 20, 50, or 100 cameras
- Single point of change for styling

### Naming Convention Best Practices

The implementation uses a specific naming strategy:

| Element | Format | Example | Purpose |
|---------|--------|---------|---------|
| Preset ID | `pgm_source_cam${i}` | `pgm_source_cam1` | Unique identifier |
| Display Name | `${i}. Camera ${i}` | `1. Camera 1` | Sortable in UI |
| Button Text | `PGM\nCAM ${i}` | `PGM\nCAM 1` | User-facing label |
| Action Option | `num: ${i}` | `num: 1` | Differentiates action |

**Why this matters:**

- **Preset ID**: Functional naming (pgm=program, source, camera type)
- **Display Name**: Number prefix ensures alphabetical sorting works correctly
- **Button Text**: Brief, operator-friendly label (KAM, CAM, etc.)
- **Action Option**: Links the button to specific behavior

### Scaling Considerations

When expanding from 12 to more cameras:

1. **Under 10 cameras per section**: Keep in one group
2. **10-20 cameras**: Use headers to break into sections
3. **20+ cameras per section**: Consider sub-categories

   ```javascript
   category: 'Switcher/Program/Sources/Cameras/Hardwired'
   category: 'Switcher/Program/Sources/Cameras/Robotic'
   category: 'Switcher/Program/Sources/Cameras/Virtual'
   ```

### Testing Checklist

After implementing camera presets:

- [ ] Headers appear in correct category
- [ ] All 12 buttons visible in preset browser
- [ ] Buttons display correct numbering (1-12)
- [ ] Text renders properly with line breaks
- [ ] Colors match design (red background, white text)
- [ ] Clicking a button triggers the correct action
- [ ] Action receives correct option number

---

## Conclusion

Presets follow a predictable, scalable pattern:

1. **Static presets** for unique controls
2. **Feedback presets** for state-aware buttons
3. **Loops** for repetitive controls
4. **Headers** for organization

By combining these patterns, you can create powerful, organized preset libraries that make your Companion module intuitive and efficient to use. The camera preset example demonstrates how this works in practice: starting with simple button definitions, organizing with headers, and scaling to larger numbers using loops and consistent naming conventions.
