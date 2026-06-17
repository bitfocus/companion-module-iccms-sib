/**
 * API for team logos to serialize to JSON.
 * @class
 */
export class ApiSportTeamLogo {
  /**
   * Team oid (in case of array return).
   * @type {number}
   */
  id;

  /**
   * File extension of the logo with dot.
   * @type {string}
   * @example ".PNG"
   */
  ext;

  /**
   * Image as a base64 string.
   * Takes a small logo first, if not available, takes a smaller logo and resizes it.
   * Can be a regular image (png, jpg) or svg image.
   * @type {string}
   */
  logoBase64;

  /**
   * Creates a new ApiSportTeamLogo instance.
   * @param {number} id - Team oid (must be >= -1)
   * @param {string} ext - File extension of the logo with dot (e.g., ".PNG", ".JPG", ".SVG")
   * @param {string} logoBase64 - Base64 encoded logo image
   * @throws {Error} If id is less than -1
   */
  constructor(id, ext, logoBase64) {
    if (id < -1) {
      throw new Error('id must be greater than or equal to -1');
    }

    this.id = id;
    this.ext = (ext && ext.trim()) ? ext.toUpperCase() : '';
    this.logoBase64 = (logoBase64 && logoBase64.trim()) ? logoBase64 : '';
  }
}
