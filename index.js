'use strict'; // eslint-disable-line

const Hapi = require('hapi');
const hapiBunyan = require('hapi-bunyan');
const fs = require('fs');
const glob = require('glob');
const dbal = require('./src/dbal');
const logger = require('./src/logger');

const INIT_SCRIPT = fs.readFileSync('./docker-entrypoint-initdb.d/INIT.sql', 'utf8');

dbal.db().query(INIT_SCRIPT).catch((err) => logger.error(err));

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
