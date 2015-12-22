'use strict'; // eslint-disable-line

const Hapi = require('hapi');
const Joi = require('joi');
const hapiBunyan = require('hapi-bunyan');
const transformer = require('./src/transformer');
const fs = require('fs');
const dbal = require('./src/dbal');
const logger = require('./src/logger');
const INIT_SCRIPT = fs.readFileSync('./docker-entrypoint-initdb.d/INIT.sql', 'utf8');
const JSONStream = require('JSONStream');
const es = require('event-stream');

dbal.db().query(INIT_SCRIPT).catch((err) => logger.error(err));

const server = new Hapi.Server();

server.connection({
  host: '0.0.0.0',
  port: 8080,
  routes: {
    timeout: {
      socket: false,
    },
  },
});

const config = {
  register: hapiBunyan,
  options: {
    logger,
  },
};

server.register(config, (err) => {
  if (err) throw err;
});

server.route({
  method: 'GET',
  path: '/healthcheck',
  handler: (request, reply) => reply('♥').type('text/plain'),
});

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
          row.standard = row.standard || 'best-practice';
          const project = result[row.origin] = result[row.origin] || { datapoints: {} };
          const datapoints = project.datapoints[row.timestamp] = project.datapoints[row.timestamp] || {};
          const standard = datapoints[row.standard] = datapoints[row.standard] || {};
          standard[row.level] = row.count;
        });
        return reply(result);
      })
      .catch((err) => {
        request.log.error(err);
        return reply(null, err);
      });
  },
});

server.route({
  method: 'POST',
  path: '/load.crawlkit',
  handler: (request, reply) => {
    logger.info('Starting load');
    const timestamp = request.query.timestamp;
    const origin = request.query.origin;

    dbal.db().tx((t) => {
      return new Promise((resolve, reject) => {
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

        request.payload
          .on('error', (err) => {
            reply(null, err).code(500);
            throw err;
          })
          .pipe(JSONStream.parse('*', (data, path) => {
            return {
              url: path.pop(),
              value: data,
            };
          }))
          .pipe(es.mapSync((singleResult) => {
            logger.info(`Transforming result for URL ${singleResult.url}`);
            transformer.transformResult(singleResult.url, singleResult.value)
              .then((transformedResults) => {
                transformedResults.forEach((result) => {
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
                    origin_library
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
                    $<origin_library>
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
                    });
                  queries.push(insert);
                });
              }, (err) => {
                reply(null, err).code(500);
                throw err;
              });
          }))
          .on('close', () => {
            logger.info(`Executing queries`);
            t.batch(queries).then(resolve, reject);
          });
      });
    })
      .then(() => {
        logger.info(`Rematerializing view`);
        return dbal.db().query(`REFRESH MATERIALIZED VIEW ${dbal.views.OVERVIEW};`);
      })
      .then(() => {
        logger.info(`Sending response`);
        reply({ error: null }).code(201);
      })
      .catch((error) => reply(null, error).code(500));
  },
  config: {
    payload: {
      output: 'stream',
      parse: 'gunzip',
      timeout: 1000 * 60 * 10/* minutes */,
      maxBytes: 1024 * 1024 * 100/* MB */,
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

server.start(() => logger.info(`Server running at: ${server.info.uri}`));
