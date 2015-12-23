'use strict'; // eslint-disable-line

const dbal = require('../dbal');

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/overview',
    config: {
      cors: true,
    },
    handler: (request, reply) => {
      dbal.db().query(`
        SELECT *
        FROM
          ${dbal.views.OVERVIEW};
        `)
        .then((data) => {
          const result = {};
          data.forEach((row) => {
            const project = result[row.origin] = result[row.origin] || {
              datapoints: {},
            };
            const datapoints = project.datapoints[row.timestamp] = project.datapoints[row.timestamp] || {
              urls: +row.urls,
            };
            datapoints[row.level] = +row.count;
          });
          return reply(result);
        })
        .catch((err) => {
          request.log.error(err);
          return reply(null, err);
        });
    },
  });
};
