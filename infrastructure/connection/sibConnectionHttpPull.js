import EventEmitter from 'events'
import {sibConnectionEvents} from './sibConnectionEvents.js'
import {logger} from '../../logger.js'
import {
  SibRateLimitError,
  sibHttpClientGetQuickButtonCollectionsAsync, sibHttpClientGetRundownsWithoutItems,
  sibHttpClientGetSibInfo,
  sibHttpClientGetTeams,
} from './sibHttpClient.js'

/**
 * Abstraction to connect to SIB2 with HTTP pulling of sib api.
 */
export class SibConnectionHttpPull extends EventEmitter {
  isInitialized = false

  /**
   * Connection properties to sib.
   * @type {SibConnection}
   */
  #sibConfig

  /**
   * Pulling timer
   * @type {NodeJS.Timer|NodeJS.Timeout|number}
   */
  #pullTimer

  /**
   * Previous db info.
   * Compare and don't raise if same.
   * @type {ApiMessageSibInfo}
   */
  #prevSibInfo

  /**
   * Previous qb collections.
   * Compare and don't raise if same.
   */
  #prevCollections

  /**
   * Previous teams collections.
   * Compare and don't raise if same.
   */
  #prevTeams

  /**
   * Previous rundowns.
   * Compare and don't raise if same.
   */
  #prevRundowns;

  /**
   * Unique ID that used to identify module in sib.
   * Not currently used.
   * @type {string}
   */
  #deviceId

  /**
   * Connect to WebSocket.
   * Tries to reconnect if the connection fails (sib is not running).
   * @param {SibConnection} config
   */
  async connectToSib(config) {
    logger.debug('Connect start to %o', config)

    this.emit(sibConnectionEvents.OnSibConnecting)

    this.#sibConfig = config
    this.#deviceId = "companion-module-iccms-sib"
    this.#prevSibInfo = null
    this.#prevTeams = null
    this.#prevCollections = null
    this.#prevRundowns = null

    clearTimeout(this.#pullTimer)
    this.#pullTimer = null

    await this.#apiTimerTick()
    this.#scheduleNextTick()

    this.isInitialized = true

    logger.debug('Connect done.')
  }

  /**
   * Close connection to sib.
   */
  disconnectFromSib() {
    logger.debug('Disconnect from sib.')

    this.isInitialized = false
    clearTimeout(this.#pullTimer)

    this.emit(sibConnectionEvents.OnSibDisconnected, '')
  }

  /**
   * Schedule the next timer tick after the current one completes.
   * Uses setTimeout to ensure ticks never overlap.
   */
  #scheduleNextTick() {
    this.#pullTimer = setTimeout(async () => {
      await this.#apiTimerTick()
      this.#scheduleNextTick()
    }, this.#sibConfig.pullIntervall)
  }

  /**
   * Try to connect to sib and reconnect if fails.
   */
  async #apiTimerTick() {
    logger.debug('Timer tick. Get data from sib api from %o.', this.#sibConfig.sibIp);

    if (!this.#sibConfig.isValid()) {
      logger.debug('Sib config is not valid.');
      this.emit(sibConnectionEvents.OnSibBadConfig, 'Enter SIB Ip in settings.');
      return;
    }

    let sinInfo;
    let prevComponent = (this.#prevSibInfo && this.#prevSibInfo.ComponentLastModified) ? this.#prevSibInfo.ComponentLastModified : null;
    let currComponent;

    try {
      sinInfo = await sibHttpClientGetSibInfo(this.#sibConfig.sibIpPort, this.#deviceId);

      currComponent = sinInfo && sinInfo.ComponentLastModified ? sinInfo.ComponentLastModified : null;

      // Always emit db info changes if changed
      if (!(JSON.stringify(this.#prevSibInfo) === JSON.stringify(sinInfo))) {
        logger.debug('Connection. Db info updated. %o', sinInfo);

        this.emit(sibConnectionEvents.OnSibDatabaseChanges, sinInfo);
      }

      if (this.#sibConfig.disableDataFetch === true) {
        logger.debug('Data fetching disabled. Skipping heavy API calls.');
        this.#prevSibInfo = sinInfo;
        this.emit(sibConnectionEvents.OnSibConnected);
        return;
      }

      // Determine if we have component timestamps for selective updates
      const hasPrev = !!prevComponent;
      const hasCurr = !!currComponent;

      // If either missing, fallback to fetching all (legacy behavior)
      const selective = hasPrev && hasCurr;

      // Track which components to update
      let shouldUpdateTeams = true;
      let shouldUpdateQuickButtons = true;
      let shouldUpdateRundowns = true;

      if (selective) {
        shouldUpdateTeams = prevComponent.Team !== currComponent.Team;
        shouldUpdateQuickButtons = prevComponent.QuickButton !== currComponent.QuickButton;
        shouldUpdateRundowns = prevComponent.Rundown !== currComponent.Rundown;

        logger.debug(
          'ComponentLastModified check — teams: %s, quickButtons: %s, rundowns: %s',
          shouldUpdateTeams ? `changed (${prevComponent.Team} → ${currComponent.Team})` : 'unchanged',
          shouldUpdateQuickButtons ? `changed (${prevComponent.QuickButton} → ${currComponent.QuickButton})` : 'unchanged',
          shouldUpdateRundowns ? `changed (${prevComponent.Rundown} → ${currComponent.Rundown})` : 'unchanged',
        );
      } else {
        logger.debug('ComponentLastModified not available (prev: %o, curr: %o) — fetching all.', prevComponent, currComponent);
      }

      // Teams
      if (shouldUpdateTeams) {
        try {
          const apiTeams = await sibHttpClientGetTeams(this.#sibConfig.sibIpPort, this.#sibConfig.token, this.#deviceId);

          if (!(JSON.stringify(this.#prevTeams) === JSON.stringify(apiTeams))) {
            logger.debug('Connection. Teams updated.');

            this.#prevTeams = apiTeams;
            this.emit(sibConnectionEvents.OnSibTeamsUpdated, apiTeams);
          }
        } catch (error) {
          if (error instanceof SibRateLimitError) {
            logger.warn('Rate limited by SIB on teams. Skipping remaining calls.');
            this.emit(sibConnectionEvents.OnSibError, 'Rate limited by SIB. Waiting for next tick.');
            this.#prevSibInfo = sinInfo;
            return;
          }
          logger.error('Sib request for teams failed, %s', error);
          this.emit(sibConnectionEvents.OnSibError, 'Request to sib failed. Check password in settings.');
        }
      }

      // QuickButton Collections
      if (shouldUpdateQuickButtons) {
        try {
          const apiCollections = await sibHttpClientGetQuickButtonCollectionsAsync(
            this.#sibConfig.sibIpPort,
            this.#sibConfig.token,
            this.#deviceId
          );

          if (!(JSON.stringify(this.#prevCollections) === JSON.stringify(apiCollections))) {
            logger.debug('Connection. Collections updated. Count: %d.', apiCollections ? apiCollections.length : 0);

            this.#prevCollections = apiCollections;
            this.emit(sibConnectionEvents.OnSibQuickButtonsUpdated, apiCollections);
          }
        } catch (error) {
          if (error instanceof SibRateLimitError) {
            logger.warn('Rate limited by SIB on collections. Skipping remaining calls.');
            this.emit(sibConnectionEvents.OnSibError, 'Rate limited by SIB. Waiting for next tick.');
            this.#prevSibInfo = sinInfo;
            return;
          }
          logger.error('Sib request for collections failed, %s', error);
          this.emit(sibConnectionEvents.OnSibError, 'Request to sib failed. Check password in settings.');
        }
      }

      // Rundowns
      if (shouldUpdateRundowns) {
        try {
          const apiRundowns = await sibHttpClientGetRundownsWithoutItems(
            this.#sibConfig.sibIpPort,
            this.#sibConfig.token,
            this.#deviceId
          );
          if (!(JSON.stringify(this.#prevRundowns) === JSON.stringify(apiRundowns))) {
            logger.debug('Connection. Rundowns updated.');

            this.#prevRundowns = apiRundowns;
            this.emit(sibConnectionEvents.OnSibRundownUpdated, apiRundowns);
          }
        } catch (error) {
          if (error instanceof SibRateLimitError) {
            logger.warn('Rate limited by SIB on rundowns. Skipping remaining calls.');
            this.emit(sibConnectionEvents.OnSibError, 'Rate limited by SIB. Waiting for next tick.');
            this.#prevSibInfo = sinInfo;
            return;
          }
          logger.error('Sib request for rundowns failed, %s', error);
          this.emit(sibConnectionEvents.OnSibError, 'Request to sib failed. Check password in settings.');
        }
      }

      // Save latest SIB info for next tick
      this.#prevSibInfo = sinInfo;

      this.emit(sibConnectionEvents.OnSibConnected);

      logger.debug('Timer tick. Done.');
    } catch (error) {
      if (error instanceof SibRateLimitError) {
        logger.warn('Rate limited by SIB on heartbeat. Waiting for next tick.');
        this.emit(sibConnectionEvents.OnSibError, 'Rate limited by SIB. Waiting for next tick.');
        return;
      }
      logger.debug('Sib request for info failed, %s.', error);
      this.emit(sibConnectionEvents.OnSibError, 'Connection to SIB failed. Check that SIB is running.');
      return;
    }
  }
}
