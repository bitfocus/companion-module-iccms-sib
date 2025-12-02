/**
 * Api info from about open database.
 */
export class ApiMessageSibInfo {
  /**
   * Program version, use to check for features.
   * @type {string}
   * @example '2.8.7257.14899'
   */
  SportInTheBoxVersion = ''

  /**
   * API response data.
   * @type {string}
   * @example '2019-11-14T09:15:11'
   */
  ResponseDate = ''

  /**
   * Current database path.
   * @type {string}
   * @example 'E:\\SIB\\MySport.SIB2'
   */
  DatabasePath = ''

  /**
   * User logon name.
   * @type {string}
   * @example 'DMITRI-LEGION\\dmitr'
   */
  LogOnName = ''

  /**
   * Last modified timestamps for components.
   * @type {{QuickButton: string, Rundown: string, Team: string}}
   * @example { QuickButton: '2025-12-02T11:34:51.6038616Z', Rundown: '2025-12-02T11:34:52.9350453Z', Team: '2025-12-02T12:34:41.5824480Z' }
   */
  ComponentLastModified = { QuickButton: '', Rundown: '', Team: '' }
}
