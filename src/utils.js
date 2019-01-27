const mapKeys = require('lodash/mapKeys');
const toLower = require('lodash/toLower');

function normalizeHeaders(headers) {
  // Express normalizes headers to lower case
  return mapKeys(headers, (value, key) => toLower(key));
}

module.exports = {
  normalizeHeaders
};
