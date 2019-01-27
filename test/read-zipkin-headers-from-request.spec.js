const mapKeys = require('lodash/mapKeys');
const values = require ('lodash/values');
const merge = require('lodash/merge');

const {
  ZipkinRequestDecorator,
  readZipkinHeadersFromRequest
} = require('../src/index');

const localServiceName = 'foobar';

describe('readZipkinHeadersFromRequest', () => {

  let zipkinRequestDecorator;

  beforeEach(() => {
    zipkinRequestDecorator = new ZipkinRequestDecorator({ localServiceName });
  });

  test('reads zipkin headers even when they have been lower-cased by Express', () => {
    const req = { headers: {} };
    zipkinRequestDecorator.addZipkinHeadersToRequest(req);

    const mockNormalizedHeaders = mapKeys(req.headers, (value, key) => key.toLowerCase());
    const mockNormalizedRequest = merge(
      {},
      req,
      { headers: mockNormalizedHeaders }
    );

    expect(values(readZipkinHeadersFromRequest(mockNormalizedRequest)))
      .toEqual(values(req.headers));
  });

});
