import { logger } from '../../logger.js'
import WebSocket from 'ws'
import * as path from 'path'

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

			logger.debug(`Send open database: ${JSON.stringify(db)} via ${localWsUrl}`)

			let ws = new WebSocket(db.SibUrlPort)

			logger.error('456')

			ws.on('open', () => {
				logger.debug('ws, open. Send data.')

				const jCommand = JSON.stringify(db)
				ws.send(jCommand)

				resolve()
			})
			ws.on('close', (code) => {
				logger.debug('ws, close.')
				reject(code)
			})

			ws.on('error', (data) => {
				logger.error('ws, error. %s', JSON.stringify(data))
				reject(data)
			})
		})
	}
}
