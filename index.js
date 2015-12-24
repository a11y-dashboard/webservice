'use strict'; // eslint-disable-line

const Hapi = require('hapi');
const hapiBunyan = require('hapi-bunyan');
const glob = require('glob');
const logger = require('./src/logger');

require('./src/setup.database.js');

const server = new Hapi.Server();

server.connection({
  host: '0.0.0.0',
  port: 8080,
  routes: {
    timeout: {
      socket: false,
    },
  },
});

const config = {
  register: hapiBunyan,
  options: {
    logger,
  },
};

server.register(config, (err) => {
  if (err) throw err;
});

glob('./src/routes/*.js', (err, files) => {
  if (err) {
    logger.error(err);
    throw err;
  }
  files.forEach((file) => require(file)(server));
  server.start(() => logger.info(`Server running at: ${server.info.uri}`));
});
