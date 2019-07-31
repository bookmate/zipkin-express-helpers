// the specific commands used here are borrowed from the source
// of the zipkin-instrumentation-express package (namely, the wrapExpressHttpProxy.js file,
// where they add zipkin headers to proxied request)
// (see https://github.com/openzipkin/zipkin-js/tree/master/packages/zipkin-instrumentation-express)

const {
  Tracer,
  ExplicitContext,
  BatchRecorder,
  Request,
  HttpHeaders,
  option,
  TraceId,
  jsonEncoder,
} = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const values = require('lodash/values');
const toLower = require('lodash/toLower');

const { normalizeHeaders } = require('./utils');

const { Some, None } = option;

function headerOption(headers, header) {
  // Here was freaking-out-comment, Some and None are parts of option type, which
  // usually is written as Just and Nothing, accordingly. You can read about them here:
  // http://adit.io/posts/2013-04-17-functors,_applicatives,_and_monads_in_pictures.html
  const val = headers[header.toLowerCase()];
  if (val) {
    return new Some(val);
  } else {
    return None;
  }
}

class ZipkinRequestDecorator {

  constructor({ localServiceName, endpoint, encoderVersion = 1 }) {
    const ctxImpl = new ExplicitContext();
    const logger = new HttpLogger({
      endpoint,
      jsonEncoder: jsonEncoder[`JSON_V${encoderVersion}`],
    });
    const recorder = new BatchRecorder({ logger });
    this.tracer = new Tracer({ ctxImpl, recorder, localServiceName });
  }

  addZipkinHeadersToRequest(req) {
    const headers = normalizeHeaders(req.headers);
    let traceId;
    if (this.hasZipkinHeaders(headers)) {
      const id = this.createIdFromHeaders(headers, this.tracer);
      this.tracer.setId(id);
      this.tracer.scoped(() => {
        this.tracer.setId(this.tracer.createChildId());
        traceId = this.tracer.id;
      });
    } else {
      this.tracer.setId(this.tracer.createRootId());
      traceId = this.tracer.id;
    }

    this.removeZipkinHeadersFromRequest(req);
    return Request.addZipkinHeaders(req, traceId);
  }

  removeZipkinHeadersFromRequest(req) {
    values(HttpHeaders).forEach(zipkinHeader => {
      const lowerCasedHeader = toLower(zipkinHeader);
      if (req.headers[zipkinHeader]) {
        delete req.headers[zipkinHeader];
      }
      if (req.headers[lowerCasedHeader]) {
        delete req.headers[lowerCasedHeader];
      }
    });
  }

  createIdFromHeaders(headers) {
    return new TraceId({
      traceId: headerOption(headers, HttpHeaders.TraceId),
      spanId: headerOption(headers, HttpHeaders.SpanId).getOrElse(),
      parentId: headerOption(headers, HttpHeaders.ParentSpanId)
    });
  }

  hasZipkinHeaders(headers) {
    return headers[toLower(HttpHeaders.TraceId)]
        && headers[toLower(HttpHeaders.SpanId)];
  }

}

module.exports = ZipkinRequestDecorator;
