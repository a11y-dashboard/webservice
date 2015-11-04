'use strict';

const Hapi = require('hapi');
const bunyan = require('bunyan');
const hapiBunyan = require('hapi-bunyan');

const server = new Hapi.Server();
let loggerConfig = {
  name: 'a11y-dashboard-webservice',
  level: module.parent ? 'error' : 'info'
};
const logger = bunyan.createLogger(loggerConfig);

server.connection({
    host: 'localhost',
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
      request.log('test', request.payload);
      //request.log('x', request.payload);
      reply(request.payload);
    }
});

server.start(() => logger.info(`Server running at: ${server.info.uri}`));

module.exports = server;
