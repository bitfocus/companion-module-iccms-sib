import { PNG } from 'pngjs'
import { colord } from 'colord'
import { logger } from '../logger.js'

const CANVAS_WIDTH = 72
const CANVAS_HEIGHT = 58
const ICON_HEIGHT = 39
const GRADIENT_HEIGHT = 10

/**
 * Composites a base64 PNG icon onto a 72x58 canvas (matching Companion visible area with topbar).
 * The icon is scaled to fill width and fit the top 2/3 (~39px) of the canvas.
 * A gradient fades from the icon area all the way to the bottom.
 *
 * When bgColorHex is provided, the canvas background is that color above the gradient,
 * and the gradient transitions from bgColor to black. The bottom 1/3 is black.
 *
 * When bgColorHex is missing/empty, the canvas is transparent and the gradient
 * fades the icon to transparent. The bottom 1/3 is transparent.
 *
 * Contract: (base64Png: string, bgColorHex?: string) => string
 * This is a decorator — can be swapped for a different implementation.
 *
 * @param {string} base64Png - Base64-encoded PNG image data.
 * @param {string} [bgColorHex] - Optional background color hex string (e.g. '#FF9999').
 * @returns {string} Base64-encoded 72x72 PNG with gradient, or empty string on error.
 */
export function composeIconWithGradient(base64Png, bgColorHex) {
  if (!base64Png) {
    return ''
  }

  try {
    // Strip data URI prefix if present
    const raw = base64Png.replace(/^data:image\/png;base64,/, '')

    const srcBuf = Buffer.from(raw, 'base64')
    const src = PNG.sync.read(srcBuf)

    // Parse background color if provided.
    // Treat null, empty string, and #838383 (default SIB gray, with or without alpha) as no color.
    let bgR = 0, bgG = 0, bgB = 0
    const isSibInterfaceGray = bgColorHex && bgColorHex.replace('#', '').toUpperCase().startsWith('838383')
    const hasBgColor = bgColorHex && bgColorHex !== '' && !isSibInterfaceGray
    if (hasBgColor) {
      const bg = colord(bgColorHex).toRgb()
      bgR = bg.r
      bgG = bg.g
      bgB = bg.b
    }

    // Scale to fill canvas width edge-to-edge
    const scale = CANVAS_WIDTH / src.width
    const scaledW = CANVAS_WIDTH
    const scaledH = Math.round(src.height * scale)

    // Center horizontally (0 for full-width, non-zero for wider-than-tall sources)
    const offsetX = 0

    const out = new PNG({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT })

    // Gradient starts before the icon's visual midpoint and runs to bottom
    const gradientStart = Math.min(scaledH, ICON_HEIGHT) - GRADIENT_HEIGHT
    const gradientLength = CANVAS_HEIGHT - gradientStart
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const idx = (y * CANVAS_WIDTH + x) * 4

        if (y < gradientStart) {
          // Above gradient: bg color or transparent
          out.data[idx] = bgR
          out.data[idx + 1] = bgG
          out.data[idx + 2] = bgB
          out.data[idx + 3] = hasBgColor ? 255 : 0
        } else {
          // Gradient from bgColor → black (or transparent), all the way to bottom
          const t = (y - gradientStart) / gradientLength
          if (hasBgColor) {
            out.data[idx] = Math.round(bgR * (1 - t))
            out.data[idx + 1] = Math.round(bgG * (1 - t))
            out.data[idx + 2] = Math.round(bgB * (1 - t))
            out.data[idx + 3] = 255
          } else {
            out.data[idx] = 0
            out.data[idx + 1] = 0
            out.data[idx + 2] = 0
            out.data[idx + 3] = 0
          }
        }
      }
    }

    // Composite source icon onto canvas with nearest-neighbor scaling
    const renderH = Math.min(scaledH, CANVAS_HEIGHT)
    for (let y = 0; y < renderH; y++) {
      const srcY = Math.min(Math.floor(y / scale), src.height - 1)

      // Icon fade factor: full above gradient, fades out through gradient zone
      let iconBlend = 1.0
      if (y >= gradientStart) {
        iconBlend = 1.0 - (y - gradientStart) / gradientLength
      }

      for (let x = 0; x < scaledW; x++) {
        const srcX = Math.min(Math.floor(x / scale), src.width - 1)
        const srcIdx = (srcY * src.width + srcX) * 4
        const outX = offsetX + x
        const outIdx = (y * CANVAS_WIDTH + outX) * 4

        const srcA = (src.data[srcIdx + 3] / 255) * iconBlend
        const dstA = out.data[outIdx + 3] / 255

        // Alpha composite: icon over background
        const outA = srcA + dstA * (1 - srcA)
        if (outA > 0) {
          out.data[outIdx] = Math.round((src.data[srcIdx] * srcA + out.data[outIdx] * dstA * (1 - srcA)) / outA)
          out.data[outIdx + 1] = Math.round((src.data[srcIdx + 1] * srcA + out.data[outIdx + 1] * dstA * (1 - srcA)) / outA)
          out.data[outIdx + 2] = Math.round((src.data[srcIdx + 2] * srcA + out.data[outIdx + 2] * dstA * (1 - srcA)) / outA)
          out.data[outIdx + 3] = Math.round(outA * 255)
        }
      }
    }

    const outBuf = PNG.sync.write(out)
    return outBuf.toString('base64')
  } catch (error) {
    logger.warn('imageProcessing. Failed to compose icon with gradient: %s', error.message)
    return ''
  }
}
