// ZipkinRequestDecorator will be mocked by Jest
const ZipkinRequestDecorator = require('../src/zipkin-request-decorator');

jest.mock('../src/zipkin-request-decorator');

const {
  createZipkinExpressMiddleware
} = require('../src/index');

const localServiceName = 'foobar';

describe('Zipkin express middleware', () => {

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    ZipkinRequestDecorator.mockClear();
  });

  test('is created with createZipkinExpressMiddleware', () => {
    const middleware = createZipkinExpressMiddleware({ localServiceName });
    expect(typeof middleware).toBe('function');
  });

  test('calls addZipkinHeadersToRequest passing the request object to it', () => {
    const req = { id: 'this is a test request' };
    const res = {};
    const next = () => {};

    const middleware = createZipkinExpressMiddleware({ localServiceName });
    middleware(req, res, next);

    const zipkinRequestDecoratorMockInstance = ZipkinRequestDecorator.mock.instances[0];

    expect(zipkinRequestDecoratorMockInstance.addZipkinHeadersToRequest)
      .toHaveBeenCalledWith(req);
  });

});
