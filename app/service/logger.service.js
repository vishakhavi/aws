const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'webapp.log'
    }),
    new(winston.transports.Console)({
      timestamp: true,
      colorize: true,
    })
  ],
});

module.exports = logger;