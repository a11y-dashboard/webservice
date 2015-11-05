const request = require('supertest');
const chai = require('chai');
chai.should();

const endpoint = process.env.ENDPOINT;

describe('Server', function() {
  it('should be available', function() {
    endpoint.should.be.defined;
    endpoint.should.be.a('string');
  });

  describe('GET /healthcheck', function() {
    it('respond with 200', function(done) {
      request(endpoint)
        .get('/healthcheck')
        .expect('Content-Type', /plain/)
        .expect(200, done);
    });
  });
})
