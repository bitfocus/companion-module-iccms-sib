import winston from 'winston'

export const logger = winston.createLogger({
	levels: winston.config.npm.levels,
	transports: [
		new winston.transports.Console({
			debugStdout: true,
			format: winston.format.combine(
				//winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.align(),
				winston.format.printf((debug) => {
					const { timestamp, level, message, ...args } = debug

					const ts = timestamp.slice(0, 19).replace('T', ' ')
					return `${ts} | ${level.toUpperCase()} | ${message} | ${
						Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
					}`
				})
			),
		}),
	],
})
