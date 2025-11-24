/**
 * Group with buttons.
 */
export class apiQuickButtonGroupWithButtons {
	/**
	 * Group.Oid.
	 * @type {number}
	 */
	Id = 0

	/**
	 * Collection.Oid.
	 * @type {number}
	 */
	CollectionId = 0

	/**
	 * 0-based
	 * @type {number}
	 */
	Order = 0

	/**
	 * @type {string}
	 */
	ButtonText = ''

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

	/**
	 * Buttons in group.
	 * @type {apiQuickButtonInGroup[]}
	 */
	Buttons = undefined

	/**
	 * Check if group has buttons.
	 * @returns {boolean}
	 */
	hasButtons() {
		return !(!Array.isArray(this.Buttons) || !this.Buttons.length)
	}
}
