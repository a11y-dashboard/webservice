const dbal = require('../../src/dbal');

module.exports = {
  truncateA11yTable: () => {
    return Promise.all([
      dbal.db().query(`TRUNCATE TABLE ${dbal.tables.A11Y};`),
      dbal.db().query(`REFRESH MATERIALIZED VIEW ${dbal.views.OVERVIEW}`),
    ]);
  },
};
