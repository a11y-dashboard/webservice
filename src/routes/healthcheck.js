'use strict'; // eslint-disable-line

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/healthcheck',
    handler: (request, reply) => {
      request.log.debug('someone is checking my health');
      reply('♥').type('text/plain');
    },
  });
};
