/**
 * Sib connection settings.
 *
 * Carries two distinct SIB credentials — do not confuse them:
 * - `token` (`configFieldId.SibPass`, UI "API Password", from SIB General settings → API)
 *   authenticates the REST API (`/api/...`): heartbeat, teams, quick buttons, rundowns,
 *   and rundown control.
 * - `helperToken` (`configFieldId.SibHelperPass`, UI "Helper Password", from the tray
 *   service helper) is used only by the WebSocket and the "open database" action.
 *
 * See docs/ARCHITECTURE.md → "Authentication — two distinct passwords".
 */
export class SibConnection {
	/**
	 * Create connection from plugin settings.
	 *
	 * There are two distinct SIB passwords, do not confuse them:
	 * - `token` authenticates the REST API (`/api/...`): heartbeat, teams, quick
	 *   buttons, rundowns, and rundown control. Sourced from `configFieldId.SibPass`
	 *   (SIB general settings → api).
	 * - `helperToken` authenticates the SIB helper running in the tray, used by the
	 *   WebSocket and the "open database" action. Sourced from
	 *   `configFieldId.SibHelperPass`.
	 *
	 * @param {string} sibIp - sib api url, like 127.0.0.2
	 * @param {number} sibPort
	 * @param {string} token - REST API password (`configFieldId.SibPass`). Appended as a
	 *   path segment to `/api/...` calls; required when the SIB API is password-protected.
	 * @param {boolean} printDebug
	 * @param {string} helperToken - SIB tray helper password (`configFieldId.SibHelperPass`).
	 *   Used only by the WebSocket / open-database paths, NOT by the REST API.
	 * @param {boolean} disableDataFetch - disable heavy API calls (teams, quick buttons, rundowns).
	 */
	constructor(sibIp, sibPort, token, printDebug, helperToken, disableDataFetch) {
		this.sibIp = sibIp
		this.sibPort = sibPort

		/**
		 * REST API password (`configFieldId.SibPass`). Authenticates all `/api/...`
		 * REST calls including rundown control.
		 * @type {string}
		 */
		this.token = token

		/**
		 * SIB tray helper password (`configFieldId.SibHelperPass`). Used only by the
		 * WebSocket and open-database paths, NOT by the REST API.
		 * @type {string}
		 */
		this.helperToken = helperToken

		/**
		 * IP and port combined.
		 * @example localhost:8080
		 * @type {string}
		 */
		this.sibIpPort = sibIp + ':' + sibPort

		this.debugMessages = printDebug
		this.pullIntervall = 10000
		this.disableDataFetch = !!disableDataFetch
	}

	/**
	 * Check if connection data is valid.
	 * @returns {boolean}
	 */
	isValid() {
		return !!this.sibIp
	}
}
