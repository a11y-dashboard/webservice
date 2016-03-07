const request = require('supertest');
const chai = require('chai');
const detailsFixture = require('./fixtures/details.json');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}:8080`;

describe('/details', function server() {
  this.timeout(60000);

  it.only('should return the correct results', (done) => {
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
        request(URL)
          .get('/details')
          .query({
            origin,
            timestamp: new Date(timestamp),
            level: 'error',
            standard: 'wcag241',
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            res.body.length.should.be.equal(2);
            detailsFixture[0].id = res.body[0].id;
            detailsFixture[1].id = res.body[1].id;
            res.body.should.be.eql(detailsFixture);
          })
          .end(done);
      });
  });
});
