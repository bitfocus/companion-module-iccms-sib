/**
 * All actions as enum.
 * @type {{OpenDatabase: string, ChangeTeam: string, TriggerEvent: string}}
 */
export const actionId = {
	/**
	 * Trigger event by TriggerId
	 */
	TriggerEvent: 'sib_action_trigger_event',

	/**
	 * Trigger event by TriggerId
	 */
	OpenDatabase: 'sib_action_open_database',

	/**
	 * Change home or guest team by id.
	 */
	ChangeTeam: 'sib_action_change_team',

	/**
	 * Rundown control actions (select rundown, run line, select prev/next).
	 */
	Rundown: 'sib_action_rundown',
}
