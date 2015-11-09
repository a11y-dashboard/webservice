const request = require('supertest');
const chai = require('chai');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}`;

describe('Server', () => {
  describe('POST /load.pa11y', () => {
    it('should fail if results are missing', (done) => {
      request(URL)
        .post('/load.pa11y')
        .send({
          timestamp: new Date().toString(),
          origin: 'XXX',
        })
        .expect(400, done);
    });

    it('should fail if timestamp is missing', (done) => {
      request(URL)
        .post('/load.pa11y')
        .send({
          origin: 'XXX',
          results: {},
        })
        .expect(400, done);
    });

    it('should fail if origin is missing', (done) => {
      request(URL)
        .post('/load.pa11y')
        .send({
          timestamp: new Date().toString(),
          results: {},
        })
        .expect(400, done);
    });

    it('should fail if origin has wrong format', (done) => {
      request(URL)
        .post('/load.pa11y')
        .send({
          timestamp: new Date().toString(),
          results: {},
          origin: 'XX',
        })
        .expect(400, done);
    });

    it('should fail if timestamp has wrong format', (done) => {
      request(URL)
        .post('/load.pa11y')
        .send({
          timestamp: 'notadate',
          results: {},
          origin: 'XXX',
        })
        .expect(400, done);
    });

    it('should accept single result', (done) => {
      const results = require('./fixtures/single_result.json');

      request(URL)
        .post('/load.pa11y')
        .send(results)
        .expect('Content-Type', /json/)
        .expect(201, {
          error: null,
        }, done);
    });

    it('should accept single result with unknown', (done) => {
      const results = require('./fixtures/single_result.json');
      results.unknown = true;

      request(URL)
        .post('/load.pa11y')
        .send(results)
        .expect('Content-Type', /json/)
        .expect(201, {
          error: null,
        }, done);
    });

    it('should accept many results', (done) => {
      const results = require('./fixtures/WAC_results.json');
      results.timestamp = '2015-11-09T10:20:30.514Z';
      results.origin = 'WAC';

      request(URL)
        .post('/load.pa11y')
        .send(results)
        .expect('Content-Type', /json/)
        .expect(201, {
          error: null,
        }, done);
    });
  });
});
