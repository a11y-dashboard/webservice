const chai = require('chai');
chai.should();

const transformer = require('../src/transformer');

describe('Transformer', () => {
  describe('urlToReverseDnsNotation', () => {
    it('should properly normalize and transform URLs', () => {
      transformer.urlToReverseDnsNotation('http://www.atlassian.com').should.equal('com.atlassian/');
      transformer.urlToReverseDnsNotation('http://www.atlassian.com:80').should.equal('com.atlassian/');
      transformer.urlToReverseDnsNotation('http://www.atlassian.com:8080').should.equal('com.atlassian:8080/');
      transformer.urlToReverseDnsNotation('http://x/some/path?b=2&a=1#hash').should.equal('x/some/path?a=1&b=2');
    });
  });
});
