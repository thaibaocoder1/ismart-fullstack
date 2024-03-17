const User = require('../models/User');
const status = require('http-status-codes');
const authMethod = require('../../auth/AuthController');

class UserController {
  async check(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(status.StatusCodes.UNAUTHORIZED)
          .send('Email không tồn tại.');
      }
      const isPasswordValid = user.password === password;
      if (!isPasswordValid) {
        return res
          .status(status.StatusCodes.UNAUTHORIZED)
          .send('Mật khẩu không chính xác.');
      }
      if (!email || !password) {
        return res.status(status.StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: "Missing required information: 'email or password'",
        });
      }
      const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
      const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      const dataForAccessToken = {
        email: user.email,
      };
      const accessToken = await authMethod.generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife,
      );
      if (!accessToken) {
        return res
          .status(status.StatusCodes.UNAUTHORIZED)
          .send('Đăng nhập không thành công, vui lòng thử lại.');
      }
      let refreshToken = await authMethod.generateToken(
        dataForAccessToken,
        refreshTokenSecret,
        refreshTokenLife,
      );
      if (!user.refreshToken) {
        await User.findOneAndUpdate(
          { email: email },
          { refreshToken: refreshToken },
        );
      } else {
        refreshToken = user.refreshToken;
      }
      if (refreshToken && accessToken) {
        return res.status(status.StatusCodes.CREATED).json({
          success: true,
          data: {
            role: user.role,
            userID: user._id,
            accessToken,
            refreshToken,
          },
        });
      } else {
        return res.status(status.StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Not found apply user',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send('Error');
    }
  }
  async index(req, res, next) {
    try {
      const users = await User.find({});
      if (users) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: users.length,
          users,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có tài khoản nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin tài khoản.',
      });
    }
  }
  async add(req, res, next) {
    try {
      const user = await User.create(req.body);
      if (user) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          user,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Lỗi khi tạo tài khoản.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lưu thông tin tài khoản.',
      });
    }
  }
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findOne({ _id: id });
      if (user) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          user,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có tài khoản nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin tài khoản.',
      });
    }
  }
}
module.exports = new UserController();
