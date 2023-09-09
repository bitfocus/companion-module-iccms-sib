/**
 * Sib connection settings.
 */
export class SibConnection {
	/**
	 * Create connection from plugin settings.
	 * @param {string} sibIp - sib api url, like 127.0.0.2
	 * @param {number} sibPort
	 * @param {string} token - auth from plugin connection settings.
	 * @param {boolean} reconnect
	 * @param {boolean} printDebug
	 * @param {boolean} resetVars
	 * @param {string} helperToken
	 */
	constructor(sibIp, sibPort, token, reconnect, printDebug, resetVars, helperToken) {
		this.sibIp = sibIp
		this.sibPort = sibPort
		this.token = token
		this.helperToken = helperToken

		/**
		 * IP and port combined.
		 * @example localhost:8080
		 * @type {string}
		 */
		this.sibIpPort = sibIp + ':' + sibPort

		this.reconnect = reconnect
		this.debugMessages = printDebug
		this.resetVariables = resetVars
		this.pullIntervall = 10000
	}

	/**
	 * Check if connection data is valid.
	 * @returns {boolean}
	 */
	isValid() {
		return !!this.sibIp
	}
}
