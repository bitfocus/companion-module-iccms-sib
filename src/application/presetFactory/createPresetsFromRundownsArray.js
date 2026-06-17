import { combineRgb } from '@companion-module/base'
import { actionId } from '../actionId.js'
import { parseBgColorToPresetBgColor } from './parseBgColorToPresetBgColor.js'
import { getForegroundColorFromBackgroundColor } from './getForegroundColorFromBackgroundColor.js'
import { composeIconWithGradient } from '../../domain/imageProcessing.js'
import {logger} from "../../logger.js";

/**
 * Generates Companion presets for all rundowns.
 * @param {ApiRundownWithoutItemsArray} allRundowns
 * @param {SibIcons} sibIcons
 * @returns {object} presets dictionary
 */
export function createPresetsFromRundownsArray(allRundowns, sibIcons) {
  logger.debug('[createPresetsFromRundownsArray] Start creating rundown presets')
  const presets = {}
  const CATEGORY = 'Rundowns'

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
      text: "Move this button to the canvas to activate",
    }

    // Buttons
    for (const action of ACTION_TYPES) {
      const presetId = `rundown_${rundown.Id}_${action.id}`
      // Helper to truncate rundown name if too long
      function truncateName(name, maxLen = 16) {
        return name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name
      }
      const truncatedName = truncateName(rundown.RundownName)

      // Use rundown color/icon if available
      let bgClrInt = parseBgColorToPresetBgColor(rundown.ColorHex)
      if (!bgClrInt || bgClrInt === 16711680) bgClrInt = action.bgcolor
      const fgColor = getForegroundColorFromBackgroundColor(rundown.ColorHex)

      const style = {
        text: `${truncatedName}\\n${action.text}`,
        size: 14,
        alignment: 'center:bottom',
        color: fgColor,
        bgcolor: bgClrInt,
        pngalignment: 'center:center',
      }

      // Add icon if available
      if (sibIcons?.hasIcon && rundown.IconId && sibIcons.hasIcon(rundown.IconId)) {
        style.png64 = composeIconWithGradient(sibIcons.getIconPngBase64(rundown.IconId))
      } else {
        logger.debug('Rundown preset. Missing icon: %s', rundown.IconId)
      }

      // Preview style for preset browser
      const previewStyle = {
        text: `Rundown\\n${action.text}`,
        size: 14,
        alignment: 'center:bottom',
        color: fgColor,
        bgcolor: bgClrInt,
        pngalignment: 'center:center',
      }
      if (style.png64) previewStyle.png64 = style.png64

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
        previewStyle,
        steps: [
          {
            down: [
              {
                actionId: actionId.Rundown,
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

  logger.debug('[createPresetsFromRundownsArray] Finished creating rundown presets')
  return presets
}
