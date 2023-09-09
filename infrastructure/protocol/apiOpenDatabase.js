/**
 * Api to open database.
 */
export class ApiOpenDatabase {
	/**
	 * URL to sib instance WebSocket.
	 * @type {string}
	 * @example ws://localhost:50492/open
	 */
	SibUrlPort = ''

	/**
	 * Program version, use to check for features.
	 * @type {string}
	 * @example C:\SIB\Test.SIB2
	 */
	FilePath = ''

	/**
	 * Exit command.
	 * @type {number}
	 * @example -1, 0, 20
	 */
	ExitDelay = -1

	/**
	 * Token from module settings, must match token in helper for sib to start.
	 * @type {string}
	 */
	Token = ''

	constructor(SibUrlPort, FilePath, ExitDelay, helperToken) {
		this.SibUrlPort = SibUrlPort
		this.FilePath = FilePath
		this.ExitDelay = ExitDelay
		this.Token = helperToken
	}
}
