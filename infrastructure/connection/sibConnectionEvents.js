/**
 * SIB event type to raise from network connection.
 * @type {{OnSibConnected: string, OnSibBadConfig: string, OnSibError: string, OnSibDisconnected: string}}
 */
export const sibConnectionEvents = {
	/**
	 * Connected to SIB instance.
	 * Corresponds to WebSocket open event.
	 */
	OnSibConnected: 'sib_connected',

	/**
	 * Connecting to SIB instance.
	 * Corresponds to WebSocket open event.
	 */
	OnSibConnecting: 'sib_connection',

	/**
	 * Connection to SIB was lost.
	 * Corresponds to WebSocket close event.
	 */
	OnSibDisconnected: 'sib_disconnected',

	/**
	 * Bad config (no address, port).
	 */
	OnSibBadConfig: 'sib_bad_config',

	/**
	 * Connection to SIB was lost.
	 * Corresponds to WebSocket error event.
	 */
	OnSibError: 'sib_error',

	/**
	 * Database changed in app.
	 */
	OnSibDatabaseChanges: 'sib_database_changed',

	/**
	 * Connect message from SIB received.
	 */
	OnSibQuickButtonsUpdated: 'sib_quick_buttons_updated',

	/**
	 * Teams were updated. Recreate presets.
	 */
	OnSibTeamsUpdated: 'sib_teams_updated',
}
