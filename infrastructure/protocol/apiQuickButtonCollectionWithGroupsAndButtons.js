/**
 * Collection full data with all groups and buttons.
 */
export class apiQuickButtonCollectionWithGroupsAndButtons {
	/**
	 * Group.Oid.
	 * @type {number}
	 */
	Id = 0

	/**
	 * 0, 1, 2.
	 * @type {number}
	 */
	CollectionType = 0

	/**
	 * @type {string}
	 */
	Text = ''

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

	/**
	 * Buttons with groups in collection.
	 * @type {apiQuickButtonGroupWithButtons[]}
	 */
	Groups = undefined

	/**
	 * Check if collection has buttons.
	 * @returns {boolean}
	 */
	hasButtons() {
		if (!Array.isArray(this.Groups) || !this.Groups.length) {
			return false
		}

		let wButtons = false

		this.Groups.every((grpWithButtons) => {
			if (grpWithButtons.hasButtons()) {
				wButtons = true
				return false
			}
			return true
		})
		return wButtons
	}
}
