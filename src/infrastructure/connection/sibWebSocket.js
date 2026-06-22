import { logger } from '../../logger.js'
import WebSocket from 'ws'

/**
 * Handles connection to SIB.
 * Launches sib and starts database.
 */
export class SibWebSocket {
	/**
	 * Connection properties to sib.
	 * @type {SibConnection}
	 */
	#sibConfig = undefined

	constructor(sibConfig) {
		this.#sibConfig = sibConfig
	}

	/**
	 * Connect to WebSocket and send command to open database.
	 * @param db {ApiOpenDatabase}
	 */
	openSibDatabaseAsync(db) {
		return new Promise((resolve, reject) => {
			//ws://localhost:50492/open
			const localWsUrl = 'ws://' + this.#sibConfig.sibIp + ':50492/open'

			db.Token = this.#sibConfig.helperToken

			logger.debug('Current config: %s', JSON.stringify(this.#sibConfig))
			logger.debug('Send open database: %s via %s', JSON.stringify(db), localWsUrl)

			let ws = new WebSocket(localWsUrl)
			let settled = false

			ws.on('open', () => {
				logger.debug('ws, open. Send data.')

				const jCommand = JSON.stringify(db)
				ws.send(jCommand, (err) => {
					if (err) {
						logger.error('ws, send error. %s', JSON.stringify(err))
						if (!settled) {
							settled = true
							reject(err)
						}
					} else if (!settled) {
						settled = true
						resolve()
					}

					// Close the socket once the command is flushed; otherwise each
					// Open-Database action would leak an open connection.
					ws.close()
				})
			})
			ws.on('close', (code) => {
				logger.debug('ws, close.')
				if (!settled) {
					settled = true
					reject(code)
				}
			})

			ws.on('error', (data) => {
				logger.error('ws, error. %s', JSON.stringify(data))
				if (!settled) {
					settled = true
					reject(data)
				}
			})
		})
	}
}
