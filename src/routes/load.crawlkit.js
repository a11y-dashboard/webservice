'use strict'; // eslint-disable-line

const dbal = require('../dbal');
const Joi = require('joi');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const transformer = require('../transformer');

module.exports = (server) => {
  server.route({
    method: 'POST',
    path: '/load.crawlkit',
    handler: (request, reply) => {
      request.log.info('Starting load');
      const timestamp = request.query.timestamp;
      const realTimestamp = timestamp.getTime();
      const origin = request.query.origin;
      const overallStats = {};

      dbal.db().tx((t) => new Promise((resolve, reject) => {
        const queries = [
          t.none(`
            DELETE FROM
              ${dbal.tables.A11Y}
            WHERE
              origin_project=$1
            AND
              crawled=$2;
            `, [origin, dbal.pgp.as.date(timestamp)]),
        ];

        request.log.info('Transforming results');
        request.payload
          .on('error', (err) => {
            reply(null, err).code(500);
            throw err;
          })
          .pipe(JSONStream.parse('*', (data, path) => ({
            url: path.pop(),
            value: data,
          })))
          .pipe(es.mapSync((singleResult) => {
            request.log.debug(`Transforming result for URL ${singleResult.url}`);
            transformer.transformResult(singleResult.url, singleResult.value)
              .then((transformedResults) => {
                transformedResults.forEach((result) => {
                  overallStats[result.type] = overallStats[result.type] || {
                    urls: new Set(),
                    count: 0,
                  };
                  overallStats[result.type].urls.add(result.url);
                  overallStats[result.type].count++;

                  const insert = t.none(`
                  INSERT INTO ${dbal.tables.A11Y}(
                    reverse_dns,
                    crawled,
                    original_url,
                    code,
                    context,
                    message,
                    selector,
                    level,
                    origin_project,
                    standard,
                    origin_library,
                    help_url
                  ) VALUES (
                    $<reverse_dns>,
                    $<crawled>,
                    $<original_url>,
                    $<code>,
                    $<context>,
                    $<message>,
                    $<selector>,
                    $<level>,
                    $<origin_project>,
                    $<standard>,
                    $<origin_library>,
                    $<help_url>
                  );
                  `,
                    {
                      reverse_dns: result.reverseDnsNotation,
                      crawled: dbal.pgp.as.date(timestamp),
                      original_url: result.url,
                      code: result.code,
                      context: result.context,
                      message: result.msg,
                      selector: result.selector,
                      level: result.type,
                      origin_project: origin,
                      standard: result.standard ? result.standard.toLowerCase() : null,
                      origin_library: result.originLibrary,
                      help_url: result.helpUrl,
                    });
                  queries.push(insert);
                });
              }, (err) => {
                reply(null, err).code(500);
                throw err;
              });
          }))
          .on('close', () => {
            request.log.info('Executing queries');
            t.batch(queries).then(resolve, reject);
          });
      }))
        .then(() => {
          request.log.info('Updating materialized view');
          return dbal.db().tx((t) => {
            const queries = [
              t.none(`
              DELETE FROM
                ${dbal.views.OVERVIEW}
              WHERE
                origin=$1
              AND
                timestamp=$2;
              `, [origin, realTimestamp]),
            ];

            request.log.info(`timestamp: ${realTimestamp}`);

            Object.keys(overallStats).forEach((level) => {
              queries.push(t.none(`
                INSERT INTO
                  ${dbal.views.OVERVIEW}(
                    origin,
                    urls,
                    timestamp,
                    level,
                    count
                  ) VALUES (
                    $<origin>,
                    $<urls>,
                    $<timestamp>,
                    $<level>,
                    $<count>
                  );
                `, {
                  origin,
                  urls: overallStats[level].urls.size,
                  timestamp: realTimestamp,
                  level,
                  count: overallStats[level].count,
                }));
            });

            return t.batch(queries);
          });
        })
        .then(() => {
          request.log.info('Sending response');
          reply({ error: null }).code(201);
        })
        .catch((error) => reply(null, error).code(500));
    },
    config: {
      payload: {
        output: 'stream',
        parse: 'gunzip',
        timeout: 1000 * 60 * 20/* minutes */,
        maxBytes: 1024 * 1024 * 200/* MB */,
      },
      description: 'This allows you to bulk-load results from crawlkit.',
      tags: ['api', 'bulk'],
      validate: {
        query: {
          origin: Joi.string().alphanum().min(3).required(),
          timestamp: Joi.date().required(),
        },
      },
    },
  });
};
