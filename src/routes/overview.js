'use strict'; // eslint-disable-line

const dbal = require('../dbal');
const Joi = require('joi');

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/overview',
    config: {
      cors: true,
      validate: {
        query: {
          minTimestamp: Joi.number().integer().min(0).default(0),
        },
      },
    },
    handler: (request, reply) => {
      dbal.db().query(`
        SELECT *
        FROM
          ${dbal.views.OVERVIEW}
        WHERE timestamp >= $1;
        `, [request.query.minTimestamp])
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
