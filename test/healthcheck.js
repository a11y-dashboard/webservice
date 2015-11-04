const request = require('supertest');
const server = require('../index');

describe('GET /healthcheck', function(){
  it('respond with 200', function(done){
    request(server.info.uri)
      .get('/healthcheck')
      .expect('Content-Type', /plain/)
      .expect(200, done);
  })
});
