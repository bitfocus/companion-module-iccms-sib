/**
 * Module config fields as enum for getConfigFields.
 * @type {{SibPort: string, SibPass: string, SibHelperPass: string, Reconnect: string, DebugMessages: string, SibIpHost: string, ResetVariables: string}}
 */
export const configFieldId = {
	// ! IMPORTANT !
	// When changing id's, upgrades script must be updated as well.

	/**
	 * Sport In The Box ip or host name.
	 */
	SibIpHost: 'sib_ip_host',

	/**
	 * Sport In The Box ip or host name, port. Default is 80.
	 */
	SibPort: 'sib_ip_port',

	/**
	 * Sport In The Box password from general settings - api.
	 */
	SibPass: 'sib_ip_pass',

	/**
	 * Sport In The Box helper password from helper in tray.
	 */
	SibHelperPass: 'sib_helper_pass',

	/**
	 * Not visible, we may want to use other connection method later.
	 */
	Reconnect: 'reconnect',

	/**
	 * Print debug in module console.
	 */
	DebugMessages: 'debug_messages',

	/**
	 * Not visible, not yet implemented, but will be.
	 */
	ResetVariables: 'reset_variables',
}
