const request = require('supertest');
const dbal = require('../src/dbal');
const chai = require('chai');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}:8080`;

describe('Server', () => {
  describe('POST /load.crawlkit', () => {
    it('should fail if results are missing', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .send({
          timestamp: new Date().toString(),
          origin: 'XXX',
        })
        .expect(400, done);
    });

    it('should fail if timestamp is missing', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .send({
          origin: 'XXX',
          results: {},
        })
        .expect(400, done);
    });

    it('should fail if origin is missing', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .send({
          timestamp: new Date().toString(),
          results: {},
        })
        .expect(400, done);
    });

    it('should fail if origin has wrong format', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .send({
          timestamp: new Date().toString(),
          results: {},
          origin: 'XX',
        })
        .expect(400, done);
    });

    it('should fail if timestamp has wrong format', (done) => {
      request(URL)
        .post('/load.crawlkit')
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
        .post('/load.crawlkit')
        .send(results)
        .expect('Content-Type', /json/)
        .expect(201, {
          error: null,
        }, done);
    });

    it('should accept single result with unknown key', (done) => {
      const results = require('./fixtures/single_result.json');
      results.unknown = true;

      request(URL)
        .post('/load.crawlkit')
        .send(results)
        .expect('Content-Type', /json/)
        .expect(201, {
          error: null,
        }, done);
    });

    it('should accept many results', (done) => {
      const results = require('./fixtures/HCC.json');
      results.timestamp = '2015-11-09T10:20:30.514Z';

      request(URL)
        .post('/load.crawlkit')
        .send(results)
        .expect('Content-Type', /json/)
        .expect(201, {
          error: null,
        }, done);
    });

    it('should replace results based on unique project and datapoint', (done) => {
      const result = require('./fixtures/single_result.json');
      result.origin = 'XXX';
      result.timestamp = '2000-10-10T10:10:10Z';

      function load(cb) {
        request(URL)
          .post('/load.crawlkit')
          .send(result)
          .expect(201, {
            error: null,
          }, cb);
      }

      load(() => load(() => {
        dbal.db().one(`
          SELECT
            COUNT(*) as count
          FROM
            ${dbal.tables.A11Y}
          WHERE
            origin_project=$1 AND crawled=$2
        `, [result.origin, dbal.pgp.as.date(new Date(result.timestamp))])
          .then((data) => {
            parseInt(data.count, 10).should.equal(157);
            done();
          })
          .catch(done);
      }));
    });
  });
});
