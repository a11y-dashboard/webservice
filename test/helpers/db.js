const dbal = require('../../src/dbal');

module.exports = {
  truncateA11yTable: () => dbal.db().tx((t) => t.batch([
    t.none(`TRUNCATE TABLE ${dbal.tables.A11Y};`),
    t.none(`TRUNCATE TABLE ${dbal.views.OVERVIEW};`),
  ])),
};
