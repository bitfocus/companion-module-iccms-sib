/**
 * Feedbacks are the way of dynamically changing the style of buttons in companion.
 * This section explains how to provide the possible feedbacks and their options to the user.
 *
 * Your module can define the list of feedbacks it supports by making a call to
 * this.setFeedbackDefinitions({ ...some feedbacks here... }).
 * You will need to do this as part of your init() method, but can also call it at any other time if you wish to update
 * the list of feedbacks exposed.
 *
 * Note: Please try not to do it too often, as updating the list has a cost.
 * If you are calling it multiple times in a short span of time, consider if it would be possible to batch the calls, so
 * it is only done once.
 *
 * The boilerplate has a file feedbacks.js which is where your feedbacks should be defined. It is not required to use
 * this structure, but it keeps it more readable than having it all in one file.
 *
 * Note: variableId must only use letters [a-zA-Z], numbers, underscore, hyphen.
 *
 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/Feedbacks">Feedbacks v3</a>
 * @see <a href="https://github.com/bitfocus/companion/wiki/Feedback">Feedbacks V2</a>
 * @see <a href="https://github.com/bitfocus/companion-module-base/wiki/Subscribe-unsubscribe-flow">Subscribe unsubscribe flow</a>
 * @param self
 * @param {SibComputer} sibComputer
 */
export function updateFeedbacks(self, sibComputer) {
	if (!self) {
		self.log('error', 'self')
		throw new Error('self')
	}
	if (!sibComputer) {
		self.log('error', 'sibComputer')
		throw new Error('sibComputer')
	}

	// Not used right now.
	let feedbacks = {}
	self.setFeedbackDefinitions(feedbacks)

	// const ColorViewActive = combineRgb(132, 165, 157)
	// const ColorViewNotActive = combineRgb(246, 189, 96)
	//
	// const ColorGreen = combineRgb(0, 200, 0)
	// const ColorOrange = combineRgb(255, 102, 0)
	//
	// feedbacks[feedbackId.ClockIsRunning] = {
	// 	type: 'boolean',
	// 	name: `Change background color when clock is running`,
	// 	description: 'Changes button background color when clock is running.',
	// 	defaultStyle: {
	// 		bgcolor: ColorGreen,
	// 	},
	// 	options: [
	// 		{
	// 			type: 'colorpicker',
	// 			label: 'Background color',
	// 			id: 'bg_clock_running',
	// 			default: ColorGreen,
	// 		},
	// 	],
	// 	callback: (feedback) => {
	// 		// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
	// 		try {
	// 			const isRunning = sibComputer.isClockRunning()
	//
	// 			logger.debug('Feedback bg_clock_running: ' + isRunning)
	// 			return isRunning
	// 		} catch (error) {
	// 			self.log('error', 'Feedback bg_clock_running: ' + error.message)
	// 			return false
	// 		}
	// 	},
	// }
	//
	// feedbacks[feedbackId.ClockIsStopped] = {
	// 	type: 'boolean',
	// 	name: `Change background color when clock is stopped`,
	// 	description: 'Changes button background color when clock is stopped.',
	// 	defaultStyle: {
	// 		bgcolor: ColorOrange,
	// 	},
	// 	options: [
	// 		{
	// 			type: 'colorpicker',
	// 			label: 'Background color',
	// 			id: 'bg_clock_stopped',
	// 			default: ColorOrange,
	// 		},
	// 	],
	// 	callback: (feedback) => {
	// 		// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
	// 		try {
	// 			const isStopped = !sibComputer.isClockRunning()
	// 			logger.debug('Feedback bg_clock_stopped: ' + isStopped)
	//
	// 			return isStopped
	// 		} catch (error) {
	// 			self.log('error', 'Feedback bg_clock_stopped: ' + error.message)
	// 			return false
	// 		}
	// 	},
	// }
	//
	// // Combined output views
	// feedbacks[feedbackId.ViewIsActive] = {
	// 	type: 'boolean',
	// 	name: `Change background color when view is active`,
	// 	description: 'Change background color when view is active',
	// 	defaultStyle: {
	// 		bgcolor: ColorViewActive,
	// 	},
	// 	options: [],
	// 	callback: (feedback) => {
	// 		// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
	// 		try {
	// 			const viewId = feedback.options[actionId.ChangeView]
	// 			const isCoViewActive = sibComputer.combinedOutputViewIsActive(viewId)
	//
	// 			logger.debug(`Feedback. View ${viewId}. ViewIsActive: {isCoViewActive}.`)
	// 			return isCoViewActive
	// 		} catch (error) {
	// 			self.log('error', 'ViewIsActive + ' + error.message)
	// 			return false
	// 		}
	// 	},
	// }
	//
	// feedbacks[feedbackId.ViewIsNotActive] = {
	// 	type: 'boolean',
	// 	name: `Change background color when view is not active`,
	// 	description: 'Change background color when view is not active',
	// 	defaultStyle: {
	// 		bgcolor: ColorViewNotActive,
	// 	},
	// 	options: [],
	// 	callback: (feedback) => {
	// 		// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
	// 		try {
	// 			const viewId = feedback.options[actionId.ChangeView]
	// 			const isNotCoViewActive = !sibComputer.combinedOutputViewIsActive(viewId)
	//
	// 			logger.debug(`Feedback. View ${viewId}. isNotCoViewActive: ${isNotCoViewActive}.`)
	// 			return isNotCoViewActive
	// 		} catch (error) {
	// 			self.log('error', 'isNotCoViewActive + ' + error.message)
	// 			return false
	// 		}
	// 	},
	// }
	// self.setFeedbackDefinitions(feedbacks)
}
