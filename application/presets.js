/**
 * Presets are a description of a ready-made button, so the user doesn't have to write button text and choose
 * a colour and add an action, they can just drag and drop a preset to an empty bank and have a button immediately ready to use.
 *
 * In order to add presets to a module, you will to call another function in your module. The process is similar to how you define actions and feedbacks.
 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/Presets">Presets V3</a>
 * @see <a href="https://github.com/bitfocus/companion/wiki/Presets">Presets V2</a>
 * @param self
 */
export function updatePresets(self) {
  const presets = {}

  // Ever called. All goes via api.
  self.setPresetDefinitions(presets)
}
