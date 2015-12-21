const dbal = require('../../src/dbal');

module.exports = {
  truncateA11yTable: () => {
    return dbal.db().tx((t) => {
      return t.batch([
        t.none(`TRUNCATE TABLE ${dbal.tables.A11Y};`),
        t.none(`REFRESH MATERIALIZED VIEW ${dbal.views.OVERVIEW}`),
      ]);
    });
  },
};
