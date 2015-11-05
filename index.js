'use strict';

const Hapi = require('hapi');
const bunyan = require('bunyan');
const hapiBunyan = require('hapi-bunyan');
const AWS = require('aws-sdk');

const NAME = 'a11y-dashboard-webservice';
const NAME_ENV = NAME.toUpperCase().replace('-','_');
const DYNAMO_TABLE_NAME = process.env[`DYNAMO_${NAME_ENV}_TABLE_NAME`];
const DYNAMO_TABLE_REGION = process.env[`DYNAMO_${NAME_ENV}_TABLE_REGION`];
const DYNAMO_ENDPOINT = process.env.DYNAMO_ENDPOINT;

let loggerConfig = {
  name: NAME,
  level: module.parent ? 'error' : 'info'
};
const logger = bunyan.createLogger(loggerConfig);

logger.info('dynamo endpoint', DYNAMO_ENDPOINT);

const server = new Hapi.Server();

server.connection({
    host: '0.0.0.0',
    port: 8080
});

let config = {
  register: hapiBunyan,
  options: {
    logger: logger,
  },
};

server.register(config, (err) => {
  if (err) throw err;
});

server.route({
    method: 'GET',
    path:'/healthcheck',
    handler: (request, reply) => reply('♥').type('text/plain')
});

server.route({
    method: 'POST',
    path:'/load',
    handler: (request, reply) => {
      reply(request.payload);
    }
});

server.start(() => logger.info(`Server running at: ${server.info.uri}`));

module.exports = server;
