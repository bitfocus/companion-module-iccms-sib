/**
 * API, team without players.
 */
export class ApiSportTeamWithoutPlayers {
	/**
	 * Team.Oid.
	 * @type {number}
	 */
	Id = 0

	/**
	 * Team name.
	 * @example Team Arlen
	 * @type {string}
	 */
	Name = ''

	/**
	 * Short team name.
	 * @example T-Arl
	 * @type {string}
	 */
	ShortName = ''

	/**
	 * #RRGGBB or #RRGGBBAA with or without hash.
	 * @type {string}
	 * @example #F2EA35FF as yellow
	 */
	TeamColorHex = ''

	constructor() {}
}
