const { HttpHeaders } = require('zipkin');
const cloneDeep = require('lodash/cloneDeep');

const {
  ZipkinRequestDecorator,
} = require('../src/index');

const localServiceName = 'foobar';

describe('ZipkinRequestDecorator', () => {

  let zipkinRequestDecorator;

  beforeEach(() => {
    zipkinRequestDecorator = new ZipkinRequestDecorator({ localServiceName });
  });

  describe('addZipkinHeadersToRequest', () => {

    test('adds zipkin headers to empty request', () => {
      const req = { headers: {} };
      const { headers } = zipkinRequestDecorator.addZipkinHeadersToRequest(req);

      expect(headers[HttpHeaders.TraceId]).toBeDefined();
      expect(headers[HttpHeaders.SpanId]).toBeDefined();
      expect(headers[HttpHeaders.SpanId]).toEqual(headers[HttpHeaders.TraceId]);
      expect(headers[HttpHeaders.ParentSpanId]).not.toBeDefined();
    });

    test('adds correct zipkin headers to request already containing zipkin headers', () => {
      const req = { headers: {} };
      const parentRequest = zipkinRequestDecorator.addZipkinHeadersToRequest(req);
      const { headers: parentHeaders } = parentRequest;
      const { headers: newHeaders } = zipkinRequestDecorator.addZipkinHeadersToRequest(cloneDeep(parentRequest));

      expect(newHeaders[HttpHeaders.TraceId]).toEqual(parentHeaders[HttpHeaders.TraceId]);
      expect(newHeaders[HttpHeaders.ParentSpanId]).toEqual(parentHeaders[HttpHeaders.SpanId]);
      expect(newHeaders[HttpHeaders.SpanId]).not.toEqual(parentHeaders[HttpHeaders.SpanId]);
    });

  });

});
