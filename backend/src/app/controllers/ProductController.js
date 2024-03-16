const Catalog = require('../models/Catalog');
const Product = require('../models/Product');
const status = require('http-status-codes');

class ProductController {
  // [GET] /products
  async index(req, res, next) {
    try {
      const products = await Product.find({}).sort('-updatedAt');
      if (products && products.length > 0) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: products.length,
          products,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có sản phẩm nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm.',
      });
    }
  }
  // [GET] /products/:id
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findOne({ _id: id }).populate('categoryID');
      if (product) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          product,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có sản phẩm nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm.',
      });
    }
  }
  // [GET] /products/:slug
  async slug(req, res, next) {
    try {
      const { slug } = req.params;
      const catalog = await Catalog.findOne({ slug });
      const products = await Product.find({ categoryID: catalog?._id });
      if (products && products.length > 0) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: products.length,
          products,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có sản phẩm nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm.',
      });
    }
  }
}
module.exports = new ProductController();