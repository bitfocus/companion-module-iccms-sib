/**
 * API. Rundown without items.
 */
export class ApiRundownWithoutItemsDto {

    /**
     * Rundown.Oid.
     * @typedef {number} Id
     */
    Id = -1;

    /**
     *  Db thing, not used in grid.
     *  @typedef {number} Order
     */
    Order = 0;

    /**
     * Name.
     * @typedef {string} RundownName
     */
    RundownName = '';

    /**
     * Background color in #RRGGBB or #RRGGBBAA format.
     * @typedef {string} ColorHex
     */
    ColorHex = '';

    /**
     * Tab icon as id.
     * @typedef {string} IconId
     */
    IconId = '';

    /**
     * SvgImage As Base64 string.
     * @typedef {string} SvgIcon
     * @deprecated since 2025-11-10 use @see IconId to get icon from sib api.
     */
    SvgIcon = '';

    /**
     * Can only be parsed from api at once.
     * @param Id
     * @param Order
     * @param RundownName
     * @param ColorHex
     * @param IconId
     * @param SvgIcon
     */
    constructor(Id, Order, RundownName, ColorHex, IconId, SvgIcon) {
        this.Id = Id;
        this.Order = Order;
        this.RundownName = RundownName;
        this.ColorHex = ColorHex;
        this.IconId = IconId;
        this.SvgIcon = SvgIcon;
    }
}

