const request = require('supertest');
const chai = require('chai');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}:8080`;

function loadFixture(origin, timestamp, done) {
  const results = require('./fixtures/HCC.json');

  request(URL)
    .post('/load.crawlkit')
    .query({
      origin,
      timestamp,
    })
    .send(results)
    .expect(201, done);
}

describe.only('Server', function server() {
  this.timeout(60000);

  describe('GET /overview', () => {
    beforeEach((done) => {
      loadFixture('HCC', '2015-11-09T10:20:30.514Z', done);
    });

    it('should show proper overview', (done) => {
      const overviewFixture = require('./fixtures/HCC.overview.json');

      request(URL)
        .get('/overview')
        .expect(200, overviewFixture, done);
    });

    it('should allow filtering', (done) => {
      const overviewFixture = require('./fixtures/HCC.overview.json');

      // load a dataset that is 10 seconds older than 2015-11-09T10:20:30.514Z
      loadFixture('HCC', '2015-11-09T10:20:20.514Z', () => {
        request(URL)
          .get('/overview')
          .query({
            minTimestamp: 1447064430000, // 2015-11-09T10:20:30.514Z
          })
          .expect(200, overviewFixture, done);
      });
    });
  });
});
