const bunyan = require('bunyan');

const BUNYAN_LEVEL = process.env.BUNYAN_LEVEL || bunyan.INFO;
const BUNYAN_FORMAT = process.env.BUNYAN_FORMAT || undefined;

const logger = bunyan.createLogger({
  name: 'a11y-dashboard-webservice',
  level: BUNYAN_LEVEL,
  format: BUNYAN_FORMAT,
});

module.exports = logger;
