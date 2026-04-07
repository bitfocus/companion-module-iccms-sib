import { PNG } from 'pngjs'
import { logger } from '../logger.js'

const CANVAS_WIDTH = 72
const CANVAS_HEIGHT = 58
// Icon is centered horizontally with 14px padding on each side (72 - 44 = 28 / 2 = 14)
const ICON_WIDTH = 44
const ICON_HEIGHT = 39

/**
 * Composites a base64 PNG icon onto a 72x58 canvas (matching Companion visible area with topbar).
 * The icon is scaled to fill width and fit the top 2/3 (~39px) of the canvas.
 *
 * The canvas is transparent above the gradient zone (so Companion's bgcolor shows through)
 * and fades to opaque black at the bottom (where the text label sits).
 *
 * Contract: (base64Png: string) => string
 * This is a decorator — can be swapped for a different implementation.
 *
 * @param {string} base64Png - Base64-encoded PNG image data.
 * @returns {string} Base64-encoded 72x58 PNG with gradient, or empty string on error.
 */
export function composeIconWithGradient(base64Png) {
  if (!base64Png) {
    return ''
  }

  try {
    // Strip data URI prefix if present
    const raw = base64Png.replace(/^data:image\/png;base64,/, '')

    const srcBuf = Buffer.from(raw, 'base64')
    const src = PNG.sync.read(srcBuf)

    // Scale to fit icon width with padding on sides
    const scale = ICON_WIDTH / src.width
    const scaledW = ICON_WIDTH
    const scaledH = Math.round(src.height * scale)

    // Center icon horizontally within canvas
    const offsetX = Math.floor((CANVAS_WIDTH - ICON_WIDTH) / 2)

    const out = new PNG({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT })

    // Gradient starts where the icon ends and runs to bottom
    const gradientStart = Math.min(scaledH, ICON_HEIGHT) - 16
    const gradientLength = CANVAS_HEIGHT - gradientStart
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const idx = (y * CANVAS_WIDTH + x) * 4

        if (y < gradientStart) {
          // Above gradient: transparent (Companion bgcolor shows through)
          out.data[idx] = 0
          out.data[idx + 1] = 0
          out.data[idx + 2] = 0
          out.data[idx + 3] = 0
        } else {
          // Gradient: transparent → opaque black
          const t = (y - gradientStart) / gradientLength
          out.data[idx] = 0
          out.data[idx + 1] = 0
          out.data[idx + 2] = 0
          out.data[idx + 3] = Math.round(t * 255)
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
