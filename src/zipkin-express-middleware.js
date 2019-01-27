const ZipkinRequestDecorator = require('./zipkin-request-decorator');

function createZipkinExpressMiddleware({ localServiceName }) {

  const zipkinRequestDecorator = new ZipkinRequestDecorator({ localServiceName });

  function zipkinExpressMiddleware(req, res, next) {
    zipkinRequestDecorator.addZipkinHeadersToRequest(req);
    next();
  }

  return zipkinExpressMiddleware;
}

module.exports = createZipkinExpressMiddleware;
