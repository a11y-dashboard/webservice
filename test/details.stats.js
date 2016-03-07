const request = require('supertest');
const chai = require('chai');
const statsFixture = require('./fixtures/details.stats.json');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}:8080`;

describe('/details.stats', function server() {
  this.timeout(60000);

  it('should return the correct results', (done) => {
    const results = require('./fixtures/HCC.json');
    const origin = 'HCC';
    const timestamp = '2015-11-09T10:20:30.514Z';
    request(URL)
      .post('/load.crawlkit')
      .query({
        origin,
        timestamp,
      })
      .send(results)
      .expect('Content-Type', /json/)
      .expect(201, {
        error: null,
      }, () => {
        // ?origin=HALBAMBOO&timestamp=1457309346000
        request(URL)
          .get('/details.stats')
          .query({
            origin,
            timestamp: new Date(timestamp),
          })
          .expect('Content-Type', /json/)
          .expect(200, statsFixture, done);
      });
  });
});
