'use strict';

const Hapi = require('hapi');
const bunyan = require('bunyan');
const hapiBunyan = require('hapi-bunyan');
const AWS = require('aws-sdk');

const NAME = 'a11y-dashboard-webservice';
const NAME_ENV = NAME.toUpperCase().replace(/-/g,'_');
const DYNAMO_TABLE_NAME = process.env[`DYNAMO_${NAME_ENV}_TABLE_NAME`];
const DYNAMO_TABLE_REGION = process.env[`DYNAMO_${NAME_ENV}_TABLE_REGION`];
const DYNAMO_ENDPOINT = process.env.DYNAMO_ENDPOINT;
const BUNYAN_LEVEL = process.env.BUNYAN_LEVEL || bunyan.INFO;

const logger = bunyan.createLogger({
  name: NAME,
  level: BUNYAN_LEVEL
});

logger.debug('DYNAMO_TABLE_NAME', DYNAMO_TABLE_NAME);
logger.debug('DYNAMO_ENDPOINT', DYNAMO_ENDPOINT);

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  endpoint: DYNAMO_ENDPOINT || undefined,
  region: DYNAMO_TABLE_REGION || undefined,
  logger: logger
});

const server = new Hapi.Server();

server.connection({
    host: '0.0.0.0',
    port: 8080
});

let config = {
  register: hapiBunyan,
  options: {
    logger: logger
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
  method: 'GET',
  path: '/test',
  handler: (request, reply) => {
    request.log('table', DYNAMO_TABLE_NAME)
    dynamodb.describeTable({
      TableName: DYNAMO_TABLE_NAME
    }, (err, data) => {
      if(err) throw err;
      reply(data).type('application/json');
    });
  }
})

server.route({
    method: 'POST',
    path:'/load',
    handler: (request, reply) => {

      reply(request.payload);
    }
});

server.start(() => logger.info(`Server running at: ${server.info.uri}`));

module.exports = server;
