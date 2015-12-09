const dbHelper = require('./helpers/db');
const request = require('supertest');
const chai = require('chai');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}:8080`;

describe('Server', () => {
  describe('GET /overview', () => {
    it('should show proper overview', (done) => {
      dbHelper.truncateA11yTable()
        .catch(done)
        .then(() => {
          const results = require('./fixtures/WAC_results.json');
          results.timestamp = '2015-11-09T10:20:30.514Z';
          results.origin = 'WAC';

          const overviewFixture = require('./fixtures/WAC_results_overview.json');

          request(URL)
            .post('/load.crawlkit')
            .send(results)
            .expect(201, () => {
              request(URL)
                .get('/overview')
                .expect(200, overviewFixture, done);
            });
        });
    });
  });
});
