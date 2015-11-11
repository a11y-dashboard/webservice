const dbal = require('../../src/dbal');

module.exports = {
  truncatePa11yTable: () => {
    return dbal.db().query(`TRUNCATE TABLE ${dbal.tables.PA11Y};`);
  },
};
