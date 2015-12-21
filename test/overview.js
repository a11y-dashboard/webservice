const request = require('supertest');
const chai = require('chai');
const dbHelper = require('./helpers/db');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}:8080`;

describe('Server', function server() {
  this.timeout(60000);

  beforeEach((done) => {
    dbHelper.truncateA11yTable().then(() => done()).catch(done);
  });

  describe('GET /overview', () => {
    it('should show proper overview', (done) => {
      const results = require('./fixtures/HCC.json');
      const overviewFixture = require('./fixtures/HCC.overview.json');

      request(URL)
        .post('/load.crawlkit')
        .query({
          origin: 'HCC',
          timestamp: '2015-11-09T10:20:30.514Z',
        })
        .send(results)
        .expect(201, () => {
          request(URL)
            .get('/overview')
            .expect(200, overviewFixture, done);
        });
    });
  });
});
