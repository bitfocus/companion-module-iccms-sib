/**
 * Module config fields as enum for getConfigFields.
 * @type {{SibPort: string, SibPass: string, SibHelperPass: string, DebugMessages: string, SibIpHost: string}}
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
	 * Print debug in module console.
	 */
	DebugMessages: 'debug_messages',

	/**
	 * Disable fetching heavy data (teams, quick buttons, rundowns) from SIB API.
	 * Heartbeat and database info are still fetched.
	 */
	DisableDataFetch: 'disable_data_fetch',
}
