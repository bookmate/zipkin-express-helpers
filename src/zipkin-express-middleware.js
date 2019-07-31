const ZipkinRequestDecorator = require('./zipkin-request-decorator');

function createZipkinExpressMiddleware(params) {

  const zipkinRequestDecorator = new ZipkinRequestDecorator(params);

  function zipkinExpressMiddleware(req, res, next) {
    zipkinRequestDecorator.addZipkinHeadersToRequest(req);
    next();
  }

  return zipkinExpressMiddleware;
}

module.exports = createZipkinExpressMiddleware;
