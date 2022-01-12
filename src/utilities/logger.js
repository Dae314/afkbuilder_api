// ./src/utilities/logger.js
const simpleLogger = require('simple-node-logger');

const logger = simpleLogger.createRollingFileLogger({
  logDirectory: 'logs/',
  fileNamePattern: 'strapi_log_<DATE>.log',
  dateFormat: 'YYYY.MM.DD',
});

if(process.env.BUILD_TYPE === 'development') logger.setLevel('debug');

module.exports = logger;
