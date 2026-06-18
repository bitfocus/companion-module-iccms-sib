/**
 * Module-wide logger.
 *
 * Why a standalone logger (not InstanceBase `this.log()`): the domain/ and
 * infrastructure/ layers are pure and hold no reference to the Companion
 * InstanceBase, so `this.log()` isn't available there. A module-level logger
 * keeps logging consistent across layers without leaking the SDK inward.
 *
 * Output goes to the console. Per Companion's logging docs, console output is
 * captured in the connection's debug log view — a supported path:
 * https://companion.free/for-developers/module-development/connection-basics/logging
 *
 * Verbosity follows the "Debug messages" connection setting — see
 * getConfigFields() in main.js (configFieldId.DebugMessages), documented at:
 * https://companion.free/for-developers/module-development/connection-basics/user-configuration/
 *
 * Runs synchronously in the module's own event loop — no worker thread or
 * background event loop (unlike e.g. pino's threaded transports), so there's
 * nothing for destroy() to tear down. Intentional design, not an oversight.
 */
import winston from 'winston'

export const logger = winston.createLogger({
	levels: winston.config.npm.levels,
	transports: [
		new winston.transports.Console({
			debugStdout: true,
			format: winston.format.combine(
				//winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.splat(),
				winston.format.align(),
				winston.format.printf((debug) => {
					const { timestamp, level, message, ...args } = debug

					const ts = timestamp.slice(0, 19).replace('T', ' ')
					return `${ts} | ${level.toUpperCase()} | ${message} | ${
						Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
					}`
				}),
			),
		}),
	],
})
