const request = require('supertest');
const chai = require('chai');
chai.should();

const endpoint = process.env.ENDPOINT;

describe('Server', function() {
  this.timeout(10000);
  before((done) => setTimeout(done, 3000))

  it('should be available', function() {
    endpoint.should.be.defined;
    endpoint.should.be.a('string');
  });
  const url = `http://${endpoint}`;

  describe('GET /healthcheck', function() {
    it('respond with 200', function(done) {
      request(url)
        .get('/healthcheck')
        .expect('Content-Type', /plain/)
        .expect(200, done);
    });
  });
})
