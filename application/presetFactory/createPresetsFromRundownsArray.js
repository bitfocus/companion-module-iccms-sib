import { combineRgb } from '@companion-module/base'
import { actionId } from '../actionId.js'
import { parseBgColorToPresetBgColor } from './parseBgColorToPresetBgColor.js'
import { getForegroundColorFromBackgroundColor } from './getForegroundColorFromBackgroundColor.js'

/**
 * Generates Companion presets for all rundowns.
 * @param {ApiRundownWithoutItemsArray} allRundowns
 * @param {SibIcons} sibIcons
 * @returns {object} presets dictionary
 */
export function createPresetsFromRundownsArray(allRundowns, sibIcons) {
  const presets = {}
  const CATEGORY = 'Presets'

  if (!allRundowns?.Rundowns?.length) return presets

  // Action types and labels
  const ACTION_TYPES = [
    {
      id: 'select_rundown',
      label: 'Select rundown',
      text: 'SELECT\\nRUNDOWN',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 51, 204), // Blue
    },
    {
      id: 'current_run_line',
      label: 'Run selected line',
      text: 'RUN\\nLINE',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 204, 0), // Green
    },
    {
      id: 'current_select_prev',
      label: 'Select previous line',
      text: 'PREV',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 0, 0), // Black
    },
    {
      id: 'current_select_next',
      label: 'Select next line',
      text: 'NEXT',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 0, 0), // Black
    },
  ]

  for (const rundown of allRundowns.Rundowns) {
    // Header
    const headerId = `header_rundown_${rundown.Id}`
    presets[headerId] = {
      type: 'text',
      category: CATEGORY,
      name: rundown.RundownName,
      text: rundown.RundownName,
    }

    // Buttons
    for (const action of ACTION_TYPES) {
      const presetId = `rundown_${rundown.Id}_${action.id}`
      // Use rundown color/icon if available
      let bgClrInt = parseBgColorToPresetBgColor(rundown.ColorHex)
      if (!bgClrInt || bgClrInt === 16711680) bgClrInt = action.bgcolor
      const fgColor = getForegroundColorFromBackgroundColor(bgClrInt)

      const style = {
        text: action.text,
        size: 'auto',
        color: fgColor,
        bgcolor: bgClrInt,
        pngalignment: 'center:center',
      }

      // Add icon if available
      if (sibIcons?.hasIcon && rundown.IconId && sibIcons.hasIcon(rundown.IconId)) {
        style.png64 = sibIcons.getIconPngBase64(rundown.IconId)
      }

      // Options for action
      const options = {
        action_type: action.id,
      }
      // Only provide rundown_id for actions that require it
      if (action.id === 'select_rundown' || action.id === 'current_run_line') {
        options.rundown_id = rundown.Id
      }

      presets[presetId] = {
        type: 'button',
        category: CATEGORY,
        name: `${rundown.RundownName} - ${action.label}`,
        style,
        steps: [
          {
            down: [
              {
                actionId: actionId.RundownControl,
                options,
              },
            ],
            up: [],
          },
        ],
        feedbacks: [],
      }
    }
  }

  return presets
}
