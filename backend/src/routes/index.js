const productRouter = require('./product');
const catalogRouter = require('./catalog');
const userRouter = require('./user');
const commentRouter = require('./comment');
const orderRouter = require('./order');
const detailRouter = require('./detail');

function routes(app) {
  app.use('/products', productRouter);
  app.use('/users', userRouter);
  app.use('/comments', commentRouter);
  app.use('/orders', orderRouter);
  app.use('/orderDetails', detailRouter);
  app.use('/catalogs', catalogRouter);
}
module.exports = routes;
