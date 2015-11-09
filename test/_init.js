const waitOn = require('wait-on');
const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}`;

describe('Test environment', function testWithTimeout() {
  this.timeout(60000);

  it('should be available', (done) => {
    waitOn({
      resources: [
        URL + '/healthcheck',
      ],
    }, (err) => {
      if (err) throw err;
      done();
    });
  });
});
