const productRouter = require('./product');
const catalogRouter = require('./catalog');
const userRouter = require('./user');
const commentRouter = require('./comment');
const orderRouter = require('./order');
const detailRouter = require('./detail');
const authMethod = require('../auth/AuthController');

function routes(app) {
  app.use('/products', authMethod.verifyAccount, productRouter);
  app.use('/users', authMethod.verifyAccount, userRouter);
  app.use('/comments', authMethod.verifyAccount, commentRouter);
  app.use('/orders', authMethod.verifyAccount, orderRouter);
  app.use('/orderDetails', authMethod.verifyAccount, detailRouter);
  app.use('/catalogs', authMethod.verifyAccount, catalogRouter);
}
module.exports = routes;
