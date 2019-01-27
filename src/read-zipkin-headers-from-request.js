const {
  HttpHeaders
} = require('zipkin');
const values = require('lodash/values');
const pick = require('lodash/pick');
const toLower = require('lodash/toLower');

const { normalizeHeaders } = require('./utils');

const readZipkinHeadersFromRequest = req =>
  pick(normalizeHeaders(req.headers), values(HttpHeaders).map(toLower));

module.exports = readZipkinHeadersFromRequest;
