const Catalog = require('../models/Catalog');
const Product = require('../models/Product');
const status = require('http-status-codes');

class ProductController {
  // [GET] /products
  async index(req, res, next) {
    const slug = req.query.slug;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    try {
      if (slug) {
        const category = await Catalog.findOne({ slug });
        const skip = (page - 1) * limit;
        const products = await Product.find({ categoryID: category._id })
          .sort('-updatedAt')
          .skip(skip)
          .limit(limit);
        const totalProducts = await Product.countDocuments({
          categoryID: category._id,
        });
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: products.length,
          products,
          pagination: {
            limit,
            currentPage: page,
            totalRows: totalProducts,
          },
        });
      } else {
        const skip = (page - 1) * limit;
        const products = await Product.find({})
          .sort('-updatedAt')
          .skip(skip)
          .limit(limit);
        const totalProducts = await Product.countDocuments();
        if (products && products.length > 0) {
          return res.status(status.StatusCodes.OK).json({
            success: true,
            results: products.length,
            products,
            pagination: {
              limit,
              currentPage: page,
              totalRows: totalProducts,
            },
          });
        } else {
          return res.status(status.StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Không có sản phẩm nào được tìm thấy.',
          });
        }
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
        return res.status(status.StatusCodes.OK).json({
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
  async add(req, res, next) {
    try {
      req.body.thumb = {
        data: `http://localhost:3001/uploads/${req.file.originalname}`,
        contentType: req.file.mimetype,
        fileName: `http://localhost:3001/uploads/${req.file.originalname}`,
      };
      const product = await Product.create(req.body);
      if (product) {
        return res.status(status.StatusCodes.CREATED).json({
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
  async update(req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!req.file) {
        if (JSON.stringify(req.body) !== JSON.stringify(product.toObject())) {
          await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
          });
        }
      } else {
        req.body.thumb = {
          data: `http://localhost:3001/uploads/${req.file.originalname}`,
          contentType: req.file.mimetype,
          fileName: `http://localhost:3001/uploads/${req.file.originalname}`,
        };
        await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
          new: true,
        });
      }
      res.status(status.StatusCodes.OK).json({
        success: true,
        message: 'Update successfully',
      });
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm.',
      });
    }
  }
  async updateOrder(req, res, next) {
    try {
      const product = await Product.findById(req.body.id);
      if (product) {
        await Product.findByIdAndUpdate({ _id: req.body.id }, req.body);
        res.status(status.StatusCodes.CREATED).json({
          success: true,
          message: 'Update successfully',
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
