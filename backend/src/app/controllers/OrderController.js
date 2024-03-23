const Order = require('../models/Order');
const status = require('http-status-codes');

class OrderController {
  async index(req, res, next) {
    try {
      const orders = await Order.find({});
      if (orders) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: orders.length,
          orders,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có đơn hàng nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin đơn hàng.',
      });
    }
  }
  async add(req, res, next) {
    try {
      const { ...data } = req.body;
      if (data) {
        const order = await Order.create(req.body);
        return res.status(status.StatusCodes.CREATED).json({
          success: true,
          data: order,
        });
      } else {
        return res.status(status.StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Thiếu thông tin.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lưu thông tin đơn hàng.',
      });
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (id) {
        await Order.deleteOne({ _id: id });
        return res.status(status.StatusCodes.OK).json({
          success: true,
          data: {
            message: 'Delete success!',
          },
        });
      } else {
        return res.status(status.StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Thiếu thông tin.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xoá thông tin đơn hàng.',
      });
    }
  }
}
module.exports = new OrderController();
