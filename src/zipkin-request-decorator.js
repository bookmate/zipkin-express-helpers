// the specific commands used here are borrowed from the source
// of the zipkin-instrumentation-express package (namely, the wrapExpressHttpProxy.js file,
// where they add zipkin headers to proxied request)
// (see https://github.com/openzipkin/zipkin-js/tree/master/packages/zipkin-instrumentation-express)

const {
  Tracer,
  ExplicitContext,
  ConsoleRecorder,
  Request,
  HttpHeaders,
  option,
  TraceId
} = require('zipkin');
const values = require('lodash/values');
const toLower = require('lodash/toLower');

const { normalizeHeaders } = require('./utils');

const { Some, None } = option;

function headerOption(headers, header) {
  // This is some monadic shit! Apparently, zipkin devs combine OOP and FP liberally
  const val = headers[header.toLowerCase()];
  if (val) {
    return new Some(val);
  } else {
    return None;
  }
}

class ZipkinRequestDecorator {

  constructor({ localServiceName }) {
    const ctxImpl = new ExplicitContext();
    const recorder = new ConsoleRecorder();
    this.tracer = new Tracer({ ctxImpl, recorder, localServiceName });
  }

  addZipkinHeadersToRequest(req) {
    const headers = normalizeHeaders(req.headers);
    let traceId;
    if (this.hasZipkinHeaders(headers)) {
      const id = this.createIdFromHeaders(headers, this.tracer);
      this.tracer.setId(id);
      this.tracer.scoped(() => {
        // we are creating a child id within the context of the parent id
        this.tracer.setId(this.tracer.createChildId());
        traceId = this.tracer.id;
      });
    } else {
      // if there are no zipkin headers in the request,
      // we are creating a new root trace id
      this.tracer.setId(this.tracer.createRootId());
      traceId = this.tracer.id;
    }

    this.removeZipkinHeadersFromRequest(req); // remove old zipkin headers from request
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
      spanId: headerOption(headers, HttpHeaders.SpanId).getOrElse(), // <-- spanId needs to be retrieved from the monad
      parentId: headerOption(headers, HttpHeaders.ParentSpanId)
    });
  }

  hasZipkinHeaders(headers) {
    return headers[toLower(HttpHeaders.TraceId)]
        && headers[toLower(HttpHeaders.SpanId)];
  }

}

module.exports = ZipkinRequestDecorator;
