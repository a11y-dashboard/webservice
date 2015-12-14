const url = require('url');
const normalizeUrl = require('normalize-url');

function urlToReverseDnsNotation(u) {
  const normalizedUrl = normalizeUrl(u);
  const parts = url.parse(normalizedUrl);

  const reversedHost = parts.hostname.split('.').reverse().join('.');
  const port = (parts.port ? `:${parts.port}` : '') || '';

  return `${reversedHost}${port}${parts.path}`;
}

const NOTICE = 'notice';
const WARNING = 'warning';
const ERROR = 'error';

function normalizeA11yDevTools(result) {
  const ret = [];

  function transformResult(targetLevel, items) {
    items.forEach((item) => {
      item.elements.forEach((culprit) => {
        ret.push({
          type: targetLevel,
          code: item.code,
          selector: culprit.selector,
          context: culprit.context,
          helpUrl: item.helpUrl,
          msg: item.msg,
          standard: null,
        });
      });
    });
  }

  transformResult(WARNING, result.warnings);
  transformResult(ERROR, result.errors);

  return ret;
}

module.exports = {
  urlToReverseDnsNotation,
  normalizeA11yDevTools,
};
