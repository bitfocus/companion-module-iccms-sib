/**
 * API. Rundown without items as single array object with helper methods.
 */
export class ApiRundownWithoutItemsArray {

  /**
   * Factory method: returns an instance with no rundowns.
   * @returns {ApiRundownWithoutItemsArray}
   */
  static empty() {
    return new ApiRundownWithoutItemsArray();
  }

  /**
   * All rundowns from api.
   * @typedef {ApiRundownWithoutItemsDto[]} Rundowns
   */
  Rundowns = [];

  /**
   * Replace current data with data from api.
   * @param {ApiRundownWithoutItemsDto[]} apiData
   */
  replace(apiData) {
    this.Rundowns = apiData;
  }

  /**
   * Clear api data.
   */
  clear() {
    this.Rundowns = [];
  }

  /**
   * Try to get rundown data from api.
   * @param id
   * @return {ApiRundownWithoutItemsDto|undefined}
   */
  getRundownsById(id) {
    return this.Rundowns.find(x => x.Id === id);
  }

  /**
   * Retrieves the first element of the Rundowns array.
   *
   * @return {ApiRundownWithoutItemsDto|null} The first rundown if the Rundowns array is not empty, otherwise null.
   */
  getFirstRundown() {
    return this.Rundowns.length > 0 ? this.Rundowns[0] : null;
  }
}
