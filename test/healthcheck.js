const request = require('supertest');
const chai = require('chai');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}`;

describe('Server', () => {
  describe('GET /healthcheck', () => {
    it('should respond with 200', (done) => {
      request(URL)
        .get('/healthcheck')
        .expect('Content-Type', /plain/)
        .expect('♥')
        .expect(200, done);
    });
  });

  describe('GET /healthcheck.db', () => {
    it('should respond with 200', (done) => {
      request(URL)
        .get('/healthcheck.db')
        .expect('Content-Type', /plain/)
        .expect('♥')
        .expect(200, done);
    });
  });
});
