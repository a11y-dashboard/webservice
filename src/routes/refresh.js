'use strict'; // eslint-disable-line

const dbal = require('../dbal');

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/refresh',
    handler: (request, reply) => {
      request.log.info(`Rematerializing view`);

      dbal.db().query(`REFRESH MATERIALIZED VIEW ${dbal.views.OVERVIEW};`)
        .then(() => {
          request.log.info('View rematerialized');
          return reply({
            error: null,
          });
        })
        .catch((err) => {
          request.log.error(err);
          return reply(err).code(500);
        });
    },
  });
};
