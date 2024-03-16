const productRouter = require('./product');
const catalogRouter = require('./catalog');

function routes(app) {
  app.use('/catalogs', catalogRouter);
  app.use('/products', productRouter);
}
module.exports = routes;
