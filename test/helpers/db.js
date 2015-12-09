const dbal = require('../../src/dbal');

module.exports = {
  truncateA11yTable: () => {
    return dbal.db().query(`TRUNCATE TABLE ${dbal.tables.A11Y};`);
  },
};
