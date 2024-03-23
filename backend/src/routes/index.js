const productRouter = require('./product');
const catalogRouter = require('./catalog');
const userRouter = require('./user');
const commentRouter = require('./comment');
const orderRouter = require('./order');

function routes(app) {
  app.use('/users', userRouter);
  app.use('/comments', commentRouter);
  app.use('/orders', orderRouter);
  app.use('/catalogs', catalogRouter);
  app.use('/products', productRouter);
}
module.exports = routes;
