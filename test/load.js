const request = require('supertest');
const dbal = require('../src/dbal');
const chai = require('chai');
const zlib = require('zlib');
chai.should();

const ENDPOINT = process.env.ENDPOINT;
const URL = `http://${ENDPOINT}:8080`;

function assertDbSize(origin, timestamp, count, done) {
  dbal.db().one(`
    SELECT
      COUNT(*) as count
    FROM
      ${dbal.tables.A11Y}
    WHERE
      origin_project=$1 AND crawled=$2
  `, [origin, dbal.pgp.as.date(new Date(timestamp))])
    .then((data) => {
      parseInt(data.count, 10).should.equal(count);
      done();
    })
    .catch(done);
}

describe('Server', function server() {
  this.timeout(60000);

  describe('POST /load.crawlkit', () => {
    it('should not fail if results are missing', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .query({
          timestamp: new Date().toString(),
          origin: 'XXX',
        })
        .send()
        .expect(201, done);
    });

    it('should fail if timestamp is missing', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .query({
          origin: 'XXX',
        })
        .send({})
        .expect(400, done);
    });

    it('should fail if origin is missing', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .query({
          timestamp: new Date().toString(),
        })
        .send({})
        .expect(400, done);
    });

    it('should fail if origin has wrong format', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .query({
          timestamp: new Date().toString(),
          origin: 'XX',
        })
        .send({})
        .expect(400, done);
    });

    it('should fail if timestamp has wrong format', (done) => {
      request(URL)
        .post('/load.crawlkit')
        .query({
          timestamp: 'notadate',
          origin: 'XXX',
        })
        .send({})
        .expect(400, done);
    });

    it('should accept single result', (done) => {
      const results = require('./fixtures/single_result.json');
      const origin = 'HCC';
      const timestamp = '2015-12-09T04:50:55.256Z';
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
          assertDbSize(origin, timestamp, 157, done);
        });
    });

    it('should accept single result with unknown key', (done) => {
      const results = require('./fixtures/single_result.json');
      results.unknown = true;
      const origin = 'HCC';
      const timestamp = '2015-12-09T04:50:55.256Z';
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
          assertDbSize(origin, timestamp, 157, done);
        });
    });

    it('should accept many results', (done) => {
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
          assertDbSize(origin, timestamp, 2520, done);
        });
    });

    it('should accept gzipped results', (done) => {
      const results = require('./fixtures/HCC.json');
      const origin = 'HCC';
      const timestamp = '2015-11-09T10:20:30.514Z';
      request(URL)
        .post('/load.crawlkit')
        .set('Content-Type', 'application/octet-stream')
        .set('Content-Encoding', 'gzip')
        .query({
          origin,
          timestamp,
        })
        .send(zlib.gzipSync(JSON.stringify(results)))
        .expect('Content-Type', /json/)
        .expect(201, {
          error: null,
        }, () => {
          assertDbSize(origin, timestamp, 2520, done);
        });
    });

    it('should replace results based on unique project and datapoint', (done) => {
      const result = require('./fixtures/single_result.json');
      const timestamp = '2000-10-10T10:10:10.000Z';
      const origin = 'XXX';
      function load(cb) {
        request(URL)
          .post('/load.crawlkit')
          .query({
            origin,
            timestamp,
          })
          .send(result)
          .expect(201, {
            error: null,
          }, cb);
      }

      load(() => load(() => {
        assertDbSize(origin, timestamp, 157, done);
      }));
    });
  });
});
