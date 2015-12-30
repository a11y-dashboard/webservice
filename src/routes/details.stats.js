'use strict'; // eslint-disable-line

const dbal = require('../dbal');
const Joi = require('joi');
const _ = require('lodash');

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/details.stats',
    config: {
      cors: true,
      description: 'This allows you to read statistics for a given culprit import.',
      tags: ['api', 'details', 'statistics'],
      validate: {
        query: {
          origin: Joi.string().alphanum().min(3).required(),
          timestamp: Joi.date().required(),
        },
      },
    },
    handler: (request, reply) => {
      const origin = request.query.origin;
      const pgDate = dbal.pgp.as.date(request.query.timestamp);
      const db = dbal.db();

      Promise.all([
        db.query(`
          SELECT
          DISTINCT
                  reverse_dns,
                  original_url
          FROM    ${dbal.tables.A11Y}
          WHERE   origin_project = $1
          AND     crawled = $2
          ORDER BY
                  reverse_dns;
          `, [
            origin,
            pgDate,
          ]),
        db.query(`
          SELECT
          DISTINCT
                  standard
          FROM    ${dbal.tables.A11Y}
          WHERE   origin_project = $1
          AND     crawled = $2
          ORDER BY
                  standard;
          `, [
            origin,
            pgDate,
          ]),
        db.query(`
          SELECT
          DISTINCT
                  level
          FROM    ${dbal.tables.A11Y}
          WHERE   origin_project = $1
          AND     crawled = $2
          ORDER BY
                  level;
          `, [
            origin,
            pgDate,
          ]),
        db.one(`
          SELECT  COUNT(*) AS count
          FROM    ${dbal.tables.A11Y}
          WHERE   origin_project = $1
          AND     crawled = $2;
          `, [
            origin,
            pgDate,
          ]),

      ])
      .then((data) => {
        const urls = data.shift();
        const standards = data.shift();
        const levels = data.shift();
        const counts = data.shift();
        return {
          urls: _.zipObject(
            _.pluck(urls, 'reverse_dns'),
            _.pluck(urls, 'original_url')
          ),
          standards: _.pluck(standards, 'standard'),
          levels: _.pluck(levels, 'level'),
          count: +counts.count,
        };
      })
      .then((transformed) => reply(transformed))
      .catch((err) => {
        request.log.error(err);
        return reply(null, err);
      });
    },
  });
};
