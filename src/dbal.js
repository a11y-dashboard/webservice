'use strict';

const pgPromise = require('pg-promise');
const logger = require('./logger');
const PG_DB_TABLE_PA11Y = 'pa11y';

const PG_DB_URL = process.env.PG_DB_URL;

const pgp = pgPromise({
  connect: (client) => logger.debug('Connected to database "%s"', client.connectionParameters.database),
  disconnect: (client) => logger.debug('Disconnecting from database "%s"', client.connectionParameters.database),
  error: (err, e) => {
    logger.error('PG_DB_URL', PG_DB_URL);
    logger.error(err, e);
  },
});

let db = null;

module.exports = {
  db: () => {
    db = db || pgp(PG_DB_URL);
    return db;
  },
  pgp,
  tables: {
    PA11Y: PG_DB_TABLE_PA11Y,
  },
};