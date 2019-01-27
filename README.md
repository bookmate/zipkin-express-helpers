# zipkin-express-helpers

Instruments for adding zipkin headers to an Express request object and for reading them back.

## Installation

`npm install --save @azangru/zipkin-express-helpers`

## Usage

If all you need is just to add zipkin headers to requests in Express (e.g. if you are using Express as a proxy), the most convenient way is to use a middleware:

```javascript
const express = require('express');
const { createZipkinExpressMiddleware } = require('@azangru/zipkin-express-helpers');

const localServiceName = 'name of this application';

const app = express();

app.use(createZipkinExpressMiddleware({localServiceName}));
```

For more fine-grained control, you may want to use ZipkinRequestDecorator (which is used in the middleware):

```javascript
const express = require('express');
const { ZipkinRequestDecorator } = require('@azangru/zipkin-express-helpers');

const localServiceName = 'name of this application';
const zipkinRequestDecorator = new ZipkinRequestDecorator({ localServiceName });

const customMiddleware = (req, res, next) => {
  zipkinRequestDecorator.addZipkinHeadersToRequest(req);
  // some custom logic
  next();
}

const app = express();

app.use(customMiddleware);
```

To read zipkin headers from a request, use `readZipkinHeadersFromRequest` function:

```javascript
const { readZipkinHeadersFromRequest } = require('@azangru/zipkin-express-helpers');

function myFunc(req) {
  const zipkinHeaders = readZipkinHeadersFromRequest(req);
  // do something with the headers
}
```
