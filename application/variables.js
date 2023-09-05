/**
 * Initialize variables.
 * Modules are able to expose values to the user, which they can use as part of the button text, or as input to some actions.
 * Note: variableId must only use letters [a-zA-Z], numbers, underscore, hyphen.
 *
 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/Variables">Variables</a>
 * @param self
 */
export function updateVariableDefinitions(self) {
	// not used at the moment.

	// const variables = []
	// variables.push({
	//   variableId: variableId.SibTime,
	//   name: 'Match time',
	// })
	// variables.push({
	//   variableId: variableId.SibIsClockRunning,
	//   name: 'Clock is running',
	// })
	// variables.push({
	//   variableId: variableId.SibScore,
	//   name: 'Current score',
	// })
	// self.setVariableDefinitions(variables)

	self.setVariableDefinitions([])
}
