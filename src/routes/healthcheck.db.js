'use strict'; // eslint-disable-line

const dbal = require('../dbal');

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/healthcheck.db',
    handler: (request, reply) => {
      dbal.db().query('SELECT $1::int AS number', ['1'])
        .then(() => {
          return reply('♥').type('text/plain');
        })
        .catch((err) => {
          request.log.error(err);
          return reply(err).code(500);
        });
    },
  });
};
