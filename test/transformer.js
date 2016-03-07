const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
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

  describe('result', () => {
    it('should be possible to transform an incoming result', () => {
      const results = require('./fixtures/single_result.json');
      const runners = results['https://www.hipchat.com/'].runners;

      const a11yDevTools = transformer.normalizeA11yDevTools(runners['a11y-dev-tools'].result);
      a11yDevTools.forEach((res) => {
        res.originLibrary = 'a11y-dev-tools'; // eslint-disable-line no-param-reassign
      });

      const axe = transformer.normalizeAxe(runners.axe.result);
      axe.forEach((res) => {
        res.originLibrary = 'axe'; // eslint-disable-line no-param-reassign
      });

      const htmlcs = transformer.normalizeHtmlcs(runners.htmlcs.result);
      htmlcs.forEach((res) => {
        res.originLibrary = 'htmlcs'; // eslint-disable-line no-param-reassign
      });

      const expectedResult = []
          .concat(a11yDevTools)
          .concat(axe)
          .concat(htmlcs);
      expectedResult.forEach((tuple) => {
        tuple.url = 'https://www.hipchat.com/'; // eslint-disable-line no-param-reassign
        tuple.reverseDnsNotation = 'com.hipchat/'; // eslint-disable-line no-param-reassign
      });

      return transformer.transformResult('https://www.hipchat.com/', results['https://www.hipchat.com/']).should.eventually.deep.equal(expectedResult);
    });

    it('should be possible to transform a result with errors', () => {
      const results = require('./fixtures/single_result_with_error.json');
      const expected = [];
      return transformer.transformResult('https://www.hipchat.com/', results['https://www.hipchat.com/']).should.eventually.deep.equal(expected);
    });

    it('should be possible to transform a result with runner errors', () => {
      const results = require('./fixtures/single_result_with_runner_error.json');
      const expected = [];
      return transformer.transformResult('https://www.hipchat.com/', results['https://www.hipchat.com/']).should.eventually.deep.equal(expected);
    });
  });

  describe('normalize', () => {
    describe('Google Chrome Accessibilty Developer Tools', () => {
      it('should properly transform an a11y-dev-tools result', () => {
        const raw = require('./fixtures/a11y-dev-tools/raw.json');
        const transformed = require('./fixtures/a11y-dev-tools/transformed.json');
        transformer.normalizeA11yDevTools(raw).should.deep.equal(transformed);
      });
    });

    describe('aXe', () => {
      it('should properly transform an axe result', () => {
        const raw = require('./fixtures/axe/raw.json');
        const transformed = require('./fixtures/axe/transformed.json');
        transformer.normalizeAxe(raw).should.deep.equal(transformed);
      });
    });

    describe('HTMLCS', () => {
      it('should properly transform an HTML CodeSniffer result', () => {
        const raw = require('./fixtures/htmlcs/raw.json');
        const transformed = require('./fixtures/htmlcs/transformed.json');
        transformer.normalizeHtmlcs(raw).should.deep.equal(transformed);
      });
    });
  });
});
