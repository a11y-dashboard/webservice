const url = require('url');
const normalizeUrl = require('normalize-url');

function urlToReverseDnsNotation(u) {
  const normalizedUrl = normalizeUrl(u);
  const parts = url.parse(normalizedUrl);

  const reversedHost = parts.hostname.split('.').reverse().join('.');
  const port = (parts.port ? `:${parts.port}` : '') || '';

  return `${reversedHost}${port}${parts.path}`;
}

module.exports = {
  urlToReverseDnsNotation,
};
