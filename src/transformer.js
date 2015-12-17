'use strict'; // eslint-disable-line

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

  function transformKey(targetLevel, items) {
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

  transformKey(WARNING, result.warnings);
  transformKey(ERROR, result.errors);

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
          standard,
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

function transformResult(uri, resultsPerUrl) {
  return new Promise((resolve) => {
    let res = [];
    const reverseDnsNotation = urlToReverseDnsNotation(uri);

    if (resultsPerUrl.runners) {
      Object.keys(resultsPerUrl.runners).forEach((runner) => {
        const runnerResults = resultsPerUrl.runners[runner].result;
        if (runnerResults) { // if this is not true, the runner probably errored
          let transformedResult;
          switch (runner) {
            case 'a11y-dev-tools':
              transformedResult = normalizeA11yDevTools(runnerResults);
              break;
            case 'axe':
              transformedResult = normalizeAxe(runnerResults);
              break;
            case 'htmlcs':
              transformedResult = normalizeHtmlcs(runnerResults);
              break;
            default:
              // ignore entry, we don't know what to do with it
              return;
          }
          transformedResult.forEach((result) => {
            result.url = uri;
            result.originLibrary = runner;
            result.reverseDnsNotation = reverseDnsNotation;
          });

          res = res.concat(transformedResult);
        }
      });
    }
    resolve(res);
  });
}

module.exports = {
  urlToReverseDnsNotation,
  normalizeA11yDevTools,
  normalizeAxe,
  normalizeHtmlcs,
  transformResult,
};
