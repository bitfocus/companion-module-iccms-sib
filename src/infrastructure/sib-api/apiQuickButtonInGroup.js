/**
 * API, qb in group.
 */
export class apiQuickButtonInGroup {
	/**
	 * Oid.
	 * @type {number}
	 */
	Id = 0

	/**
	 * Event Oid.
	 * @type {number}
	 */
	EventId = 0

	/**
	 * Button Oid.
	 * @type {string}
	 */
	ButtonId = ''

	/**
	 * @type {string}
	 */
	ButtonText = ''

	/**
	 * 0-based
	 * @type {number}
	 */
	Order = 0

	/**
	 * #RRGGBB or #RRGGBBAA with or without hash.
	 * @type {string}
	 */
	BackgroundColorHex = ''

	/**
	 * icon name.
	 * @type {string}
	 */
	IconId = ''

	/**
	 * BASE64 encoded svg image.
	 * @type {string}
	 */
	SvgIcon = ''

	constructor() {}
}
