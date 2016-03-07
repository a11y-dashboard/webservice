const logger = require('./logger');
const fs = require('fs');
const dbal = require('./dbal');
dbal.db().one(`
  SELECT COUNT(*) AS count
  FROM   pg_class
  JOIN   pg_namespace
     ON pg_namespace.oid = pg_class.relnamespace
  WHERE  pg_namespace.nspname = 'public'
  `)
  .then((res) => {
    if (!res.count) {
      logger.debug('Setting up database');
      const INIT_SCRIPT = fs.readFileSync('./docker-entrypoint-initdb.d/INIT.sql', 'utf8');
      dbal.db().query(INIT_SCRIPT);
      return;
    }
    logger.debug('Database has been set up already!');
  })
  .catch((err) => {
    logger.error(err);
    throw err;
  });
