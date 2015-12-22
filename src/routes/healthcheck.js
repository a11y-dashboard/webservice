'use strict'; // eslint-disable-line

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/healthcheck',
    handler: (request, reply) => reply('♥').type('text/plain'),
  });
};
