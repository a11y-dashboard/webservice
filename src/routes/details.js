'use strict'; // eslint-disable-line

const dbal = require('../dbal');
const Joi = require('joi');
const levels = require('../levels.json');

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/details',
    config: {
      cors: true,
      description: 'This allows you to read culprit details.',
      tags: ['api', 'details'],
      validate: {
        query: {
          origin: Joi.string().alphanum().min(3).required(),
          reverseDns: Joi.string().default('%'),
          timestamp: Joi.date().required(),
          level: Joi.string().allow(levels).required(),
        },
      },
    },
    handler: (request, reply) => {
      const timestamp = request.query.timestamp;
      const origin = request.query.origin;
      const level = request.query.level;
      const reverseDns = request.query.reverseDns;

      dbal.db().query(`
        SELECT  reverse_dns,
                original_url,
                code,
                context,
                message,
                help_url,
                selector,
                origin_library,
                standard
        FROM    ${dbal.tables.A11Y}
        WHERE   origin_project = $1
        AND     crawled = $2
        AND     level = $3
        AND     reverse_dns LIKE $4
        ORDER BY
                reverse_dns,
                origin_library,
                code;
        `, [
          origin,
          dbal.pgp.as.date(timestamp),
          level,
          reverseDns,
        ])
        .then((data) => {
          return reply(data);
        })
        .catch((err) => {
          request.log.error(err);
          return reply(null, err);
        });
    },
  });
};
