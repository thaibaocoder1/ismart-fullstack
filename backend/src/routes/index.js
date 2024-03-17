const productRouter = require('./product');
const catalogRouter = require('./catalog');
const userRouter = require('./user');

function routes(app) {
  app.use('/users', userRouter);
  app.use('/catalogs', catalogRouter);
  app.use('/products', productRouter);
}
module.exports = routes;
