const url = require('url');
const normalizeUrl = require('normalize-url');
const objectAssign = require('object-assign');

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

function determineAxeLevel(impact) {
  if (impact === 'minor') {
    return NOTICE;
  }
  if (impact === 'moderate') {
    return WARNING;
  }
  if (impact === 'serious' || impact === 'critical') {
    return ERROR;
  }
  // unknown will be treated as notices
  return NOTICE;
}

function normalizeAxe(result) {
  const ret = [];

  result.forEach((rule) => {
    rule.tags.forEach((standard) => {
      rule.nodes.forEach((node) => {
        ret.push({
          type: determineAxeLevel(node.impact),
          code: rule.id,
          selector: node.target.join(',\n'),
          context: node.html,
          helpUrl: rule.helpUrl,
          msg: rule.description,
          standard: standard,
        });
      });
    });
  });

  return ret;
}

function normalizeHtmlcs(result) {
  const ret = [];

  Object.keys(result).forEach((standard) => {
    const standardResults = result[standard];
    standardResults.forEach((standardResult) => {
      ret.push(objectAssign({}, standardResult, {
        standard,
        helpUrl: null,
      }));
    });
  });

  return ret;
}

module.exports = {
  urlToReverseDnsNotation,
  normalizeA11yDevTools,
  normalizeAxe,
  normalizeHtmlcs,
};
