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

  describe('normalizeA11yDevTools', () => {
    it('should properly transform an a11y-dev-tools result', () => {
      const raw = require('./fixtures/a11y-dev-tools/raw.json');
      const transformed = require('./fixtures/a11y-dev-tools/transformed.json');
      transformer.normalizeA11yDevTools(raw).should.deep.equal(transformed);
    });
  });
});
