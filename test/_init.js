const waitOn = require('wait-on');
const dbHelper = require('./helpers/db');
const ENDPOINT = process.env.ENDPOINT;

before(function testWithTimeout(done) {
  this.timeout(60000);
  console.log('waiting for webserver and postgres...'); // eslint-disable-line no-console

  waitOn({
    resources: [
      `tcp:${ENDPOINT}:8080`,
      `tcp:${ENDPOINT}:54321`,
    ],
  }, (err) => {
    if (err) {
      done(err);
      return;
    }
    dbHelper.truncateA11yTable().then(() => done()).catch(done);
  });
});

afterEach((done) => {
  dbHelper.truncateA11yTable().then(() => done()).catch(done);
});
