const Order = require('../models/Order');
const Detail = require('../models/Detail');
const status = require('http-status-codes');
const PDFDocument = require('pdfkit-table');
const transporter = require('../../middlewares/mailer');
const path = require('path');
const fs = require('fs');

class OrderController {
  async index(req, res, next) {
    try {
      const orders = await Order.find({}).sort('-createdAt');
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
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById({ _id: id });
      if (order) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          order,
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
  async invoice(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById({ _id: id });
      const orderDetail = await Detail.find({ orderID: id }).populate(
        'productID',
      );
      if (order) {
        const invoiceFolderPath = 'src/public/invoice';
        const fileName = `invoice.pdf`;
        const filePath = path.join(invoiceFolderPath, fileName);
        const fontPath = 'src/fonts/Roboto-Regular.ttf';
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc
          .font(fontPath)
          .fontSize(20)
          .text('Hoá đơn thanh toán iSmart', { align: 'center' });
        doc.moveDown();
        doc.font(fontPath).text(`Thông tin khách hàng:`);
        doc.font(fontPath).fontSize(12).text(`Tên: ${order.fullname}`);
        doc.font(fontPath).fontSize(12).text(`Địa chỉ: ${order.address}`);
        doc.font(fontPath).fontSize(12).text(`Email: ${order.email}`);
        doc.font(fontPath).fontSize(12).text(`Số điện thoại: ${order.phone}`);
        doc.moveDown();
        doc.font(fontPath).text(`Thông tin đơn hàng:`);
        const totalAmount = orderDetail.reduce(
          (total, item) => total + item.quantity * item.price,
          0,
        );
        const table = {
          headers: ['Tên sản phẩm', 'Số lượng', 'Giá', 'Thành tiền'],
          rows: orderDetail.map((item) => [
            item.productID.name,
            item.quantity,
            item.price,
            item.quantity * item.price,
          ]),
        };
        table.rows.push(['Tổng tiền', '', '', totalAmount]);
        const tableOptions = {
          prepareHeader: () =>
            doc.font(fontPath).fontSize(12).fillColor('black'),
          prepareRow: (row, i) =>
            doc.font(fontPath).fontSize(10).fillColor('black'),
        };
        await doc.table(table, {
          width: 300,
          columnsSize: [200, 100, 100, 100],
          ...tableOptions,
        });
        doc.moveDown();
        doc
          .font(fontPath)
          .text(`Ngày lập hoá đơn: ${order.createdAt}`, { align: 'right' });
        // done!
        doc.end();
        const pdfContent = fs.readFileSync(filePath);

        const info = await transporter.sendMail({
          from: 'Ismart admin',
          to: 'demogamer0809@gmail.com',
          subject: 'Đơn hành thanh toán tại iSmart ✔',
          text: 'Đơn hành thanh toán tại iSmart',
          attachments: [
            {
              filename: 'invoice.pdf',
              content: pdfContent,
            },
          ],
        });
        res.status(status.StatusCodes.OK).json({
          success: true,
          data: {
            message: 'Send bill successfully!',
            messageId: info.messageId,
          },
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có đơn hàng nào được tìm thấy.',
        });
      }
    } catch (error) {
      console.log(error);
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
  async update(req, res, next) {
    try {
      const { id, status: STATUS } = req.body;
      if (id) {
        if (status !== 1) {
          const order = await Order.findOneAndUpdate(
            { _id: id },
            { status: STATUS },
            { new: true },
          );
          return res.status(status.StatusCodes.CREATED).json({
            success: true,
            order,
          });
        } else {
          return res.status(status.StatusCodes.OK).json({
            success: true,
            message: 'Cập nhật thành công.',
          });
        }
      } else {
        return res.status(status.StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Thiếu thông tin.',
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật thông tin đơn hàng.',
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
