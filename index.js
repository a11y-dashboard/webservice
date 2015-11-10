const Hapi = require('hapi');
const Joi = require('joi');
const bunyan = require('bunyan');
const hapiBunyan = require('hapi-bunyan');
const pgPromise = require('pg-promise');
const transformer = require('./src/transformer');
const fs = require('fs');

const NAME = 'a11y-dashboard-webservice';
const PG_DB_URL = process.env[`PG_DB_URL`];
const PG_DB_TABLE_PA11Y = 'pa11y';
const BUNYAN_LEVEL = process.env.BUNYAN_LEVEL || bunyan.INFO;

const logger = bunyan.createLogger({
  name: NAME,
  level: BUNYAN_LEVEL,
});

logger.debug('PG_DB_URL', PG_DB_URL);

const pgp = pgPromise({
  connect: (client) => logger.debug('Connected to database "%s"', client.connectionParameters.database),
  disconnect: (client) => logger.debug('Disconnecting from database "%s"', client.connectionParameters.database),
  error: (err, e) => logger.error(err, e),
});
const db = pgp(PG_DB_URL);

db.query(fs.readFileSync('./docker-entrypoint-initdb.d/INIT.sql', 'utf8')).catch((err) => logger.error(err));

const server = new Hapi.Server();

server.connection({
  host: '0.0.0.0',
  port: 8080,
});

const config = {
  register: hapiBunyan,
  options: {
    logger: logger,
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
    db.query('SELECT $1::int AS number', ['1'])
      .then(() => {
        reply('♥').type('text/plain');
      })
      .catch((err) => {
        request.log.error(err);
        reply(err).code(500);
      });
  },
});

server.route({
  method: 'POST',
  path: '/load.pa11y',
  handler: (request, reply) => {
    const results = request.payload.results;
    const timestamp = new Date(request.payload.timestamp);
    const origin = request.payload.origin;

    const inserts = [];
    db.tx((t) => {
      Object.keys(results).map((url) => {
        const reverseDnsNotation = transformer.urlToReverseDnsNotation(url);
        const resultsPerUrl = results[url];
        resultsPerUrl.forEach((result) => {
          const insert = t.none(`
          INSERT INTO ${PG_DB_TABLE_PA11Y}(
            reverse_dns,
            crawled,
            original_url,
            code,
            context,
            message,
            selector,
            level,
            origin
          ) VALUES (
            $<reverse_dns>,
            $<crawled>,
            $<original_url>,
            $<code>,
            $<context>,
            $<message>,
            $<selector>,
            $<level>,
            $<origin>
          )
          `,
            {
              reverse_dns: reverseDnsNotation,
              crawled: pgp.as.date(timestamp),
              original_url: url,
              code: result.code,
              context: result.context,
              message: result.message,
              selector: result.selector,
              level: result.type,
              origin: origin,
            });
          inserts.push(insert);
        });
      });
      return t.batch(inserts);
    })
      .then(() => reply({ error: null }).code(201))
      .catch((error) => reply({ error: error }).code(500));
  },
  config: {
    description: 'This allows you to bulk-load results from pa11y-crawler.',
    tags: ['api', 'bulk'],
    validate: {
      payload: Joi.object().keys({
        origin: Joi.string().alphanum().min(3).required(),
        timestamp: Joi.date().required(),
        results: Joi.object().required(),
      }).unknown(),
    },
  },
});

server.start(() => logger.info(`Server running at: ${server.info.uri}`));
