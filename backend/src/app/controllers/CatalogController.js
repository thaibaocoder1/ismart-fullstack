const Catalog = require('../models/Catalog');
const status = require('http-status-codes');

class CatalogController {
  async index(req, res, next) {
    try {
      const catalogs = await Catalog.find({});
      if (catalogs) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: catalogs.length,
          catalogs,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có danh mục nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin danh mục.',
      });
    }
  }
}

module.exports = new CatalogController();
