const User = require('../models/User');
const status = require('http-status-codes');
const authMethod = require('../../auth/AuthController');
const mailer = require('../../middlewares/mailer');
const bcrypt = require('bcrypt');

class UserController {
  // Get all
  async index(req, res, next) {
    try {
      const users = await User.find({}).sort('-createdAt');
      const countDeleted = await User.countDocumentsWithDeleted({
        deleted: true,
      });
      const usersRemove = await User.findWithDeleted({ deleted: true });
      if (users) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: users.length,
          countDeleted,
          usersRemove,
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
  // Add
  async add(req, res, next) {
    try {
      const { ...data } = req.body;
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(data.password, salt);
      const hashCPassowrd = bcrypt.hashSync(data.password_confirmation, salt);
      data.password = hashPassword;
      data.password_confirmation = hashCPassowrd;
      const user = await User.create(data);
      const content = `<b>Vui lòng click vào đường link này để xác thực việc kích hoạt tài khoản. <a href="http://localhost:5173/active.html?id=${user._id}">Xác thực</a></b>`;
      const send = await mailer.sendMail({
        from: 'iSmart Admin',
        to: user.email,
        subject: 'Kích hoạt tài khoản tại hệ thống iSmart ✔',
        text: 'Kích hoạt tài khoản tại hệ thống iSmart',
        html: content,
      });
      if (user && send) {
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
  async addForm(req, res, next) {
    try {
      const { ...data } = req.body;
      if (req.file) {
        data.imageUrl = `http://localhost:3001/uploads/${req.file.originalname}`;
      }
      const user = await User.findOne({ email: data.email });
      if (user) {
        return res.status(status.StatusCodes.CONFLICT).json({
          success: false,
          message: 'User is exist! Please try again with another email!',
        });
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync('passwordtemp', salt);
        const hashCPassowrd = bcrypt.hashSync('passwordtemp', salt);
        data.password = hashPassword;
        data.password_confirmation = hashCPassowrd;
        data.isActive = true;
        await User.create(data);
        return res.status(status.StatusCodes.CREATED).json({
          success: true,
          data: user,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lưu thông tin tài khoản.',
      });
    }
  }
  // Get one
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findOne({
        _id: id,
      });
      if (user) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          user,
        });
      } else {
        res.clearCookie('refreshToken');
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          isRedirect: true,
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
  // Update
  async update(req, res, next) {
    try {
      const { ...payload } = req.body;
      const user = await User.findById(req.params.id);
      const salt = bcrypt.genSaltSync(10);
      if (!req.file && payload.password === '') {
        if (JSON.stringify(payload) !== JSON.stringify(user.toObject())) {
          delete payload.password;
          delete payload.password_confirmation;
          await User.findOneAndUpdate({ _id: req.params.id }, payload, {
            new: true,
          });
        }
      } else {
        if (req.file && payload.password !== '') {
          payload.imageUrl = `http://localhost:3001/uploads/${req.file.originalname}`;
          if (payload.admin && payload.admin === 'true') {
            await User.findOneAndUpdate({ _id: req.params.id }, payload, {
              new: true,
            });
          } else {
            const hashPassword = bcrypt.hashSync(payload.password, salt);
            const hashCPassowrd = bcrypt.hashSync(
              payload.password_confirmation,
              salt,
            );
            payload.password = hashPassword;
            payload.password_confirmation = hashCPassowrd;
            await User.findOneAndUpdate({ _id: req.params.id }, payload, {
              new: true,
            });
          }
        } else {
          if (req.file) {
            payload.imageUrl = `http://localhost:3001/uploads/${req.file.originalname}`;
            delete payload.password;
            delete payload.password_confirmation;
            await User.findOneAndUpdate({ _id: req.params.id }, payload, {
              new: true,
            });
          } else {
            if (payload.admin && payload.admin === 'true') {
              await User.findOneAndUpdate({ _id: req.params.id }, payload, {
                new: true,
              });
            } else {
              const hashPassword = bcrypt.hashSync(payload.password, salt);
              const hashCPassowrd = bcrypt.hashSync(
                payload.password_confirmation,
                salt,
              );
              payload.password = hashPassword;
              payload.password_confirmation = hashCPassowrd;
              await User.findOneAndUpdate({ _id: req.params.id }, payload, {
                new: true,
              });
            }
          }
        }
      }
      if (payload.password !== '' && payload.password_confirmation !== '') {
        res.status(status.StatusCodes.OK).json({
          success: true,
          isLogout: true,
          message: 'Update successfully',
        });
      } else {
        res.status(status.StatusCodes.OK).json({
          success: true,
          message: 'Update successfully',
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin tài khoản.',
      });
    }
  }
  async updateField(req, res, next) {
    try {
      const { id, oldPassword, password, password_confirmation } = req.body;
      console.log(req.body);
      const user = await User.findById({ _id: id });
      if (user) {
        const isValidPassword = await bcrypt.compare(
          oldPassword,
          user.password,
        );
        if (isValidPassword) {
          if (oldPassword === password) {
            return res.status(status.StatusCodes.CONFLICT).json({
              success: false,
              message: 'Mật khẩu mới không được trùng với mật khẩu cũ.',
            });
          } else {
            const salt = bcrypt.genSaltSync(10);
            const hashPassword = bcrypt.hashSync(password, salt);
            const hashCPassword = bcrypt.hashSync(password_confirmation, salt);
            await User.findOneAndUpdate(
              { _id: id },
              { password: hashPassword, password_confirmation: hashCPassword },
              { new: true },
            );
            return res.status(status.StatusCodes.CREATED).json({
              success: true,
              message: 'Đổi mật khẩu thành công',
            });
          }
        } else {
          return res.status(status.StatusCodes.OK).json({
            success: false,
            message: 'Mật khẩu không trùng với hệ thống!',
          });
        }
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin tài khoản.',
      });
    }
  }
  // Delete
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById({ _id: id });
      if (user) {
        if (user.role.toLowerCase() === 'user') {
          await User.delete({ _id: id });
          res.status(status.StatusCodes.OK).json({
            success: true,
            message: 'Remove successfully!',
          });
        } else {
          res.status(status.StatusCodes.OK).json({
            success: false,
            message: "Can't remove admin account!",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }
  // Restore
  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findOneDeleted({ _id: id });
      if (user) {
        await User.restore({ _id: id });
        res.status(status.StatusCodes.OK).json({
          success: true,
          message: 'Restore successfully!',
        });
      }
    } catch (error) {
      next(error);
    }
  }
  // Reset password
  async reset(req, res, next) {
    try {
      const { id } = req.body;
      const user = await User.findOne({ _id: id });
      if (user) {
        const now = Math.floor(Date.now() / 1000);
        const timer = Math.floor(user.resetedAt / 1000);
        if (now - timer > 300) {
          res.status(status.StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Reset failed!',
          });
        } else {
          req.body.resetedAt = 0;
          const salt = bcrypt.genSaltSync(10);
          const hashPassword = bcrypt.hashSync(req.body.password, salt);
          const hashCPassword = bcrypt.hashSync(
            req.body.password_confirmation,
            salt,
          );
          req.body.password = hashPassword;
          req.body.password_confirmation = hashCPassword;
          await User.findOneAndUpdate({ _id: id }, req.body);
          res.status(status.StatusCodes.OK).json({
            success: true,
            message: 'Reset successfully!',
          });
        }
      }
    } catch (error) {
      res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error from SERVER!',
      });
    }
  }
  // Auth
  async check(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(status.StatusCodes.OK).json({
          success: false,
          message: 'Tài khoản không tồn tại hoặc đã bị xoá.',
        });
      }
      if (!user.isActive) {
        return res.status(status.StatusCodes.OK).json({
          success: false,
          message: 'Tài khoản chưa được kích hoạt.',
        });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(status.StatusCodes.OK).json({
          success: false,
          message: 'Mật khẩu không chính xác.',
        });
      }
      if (!email || !password) {
        return res.status(status.StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: "Missing required information: 'email or password'",
        });
      }
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;
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
      if (user.role === 'User') {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: false,
        });
        res.status(status.StatusCodes.CREATED).json({
          success: true,
          data: {
            role: user.role,
            id: user._id,
            accessToken,
            expireIns: Date.now() + Number.parseInt(process.env.TIMER),
          },
        });
      } else {
        res.cookie('refreshTokenAdmin', refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: false,
        });
        res.status(status.StatusCodes.CREATED).json({
          success: true,
          data: {
            role: user.role,
            id: user._id,
            accessToken,
            expireIns: Date.now() + Number.parseInt(process.env.TIMER),
          },
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send('Error');
    }
  }
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        res.status(status.StatusCodes.OK).json({
          remove: true,
        });
      }
      const verifyToken = await authMethod.decodeToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      if (verifyToken) {
        const newAccessToken = await authMethod.generateToken(
          verifyToken.payload,
          process.env.ACCESS_TOKEN_SECRET,
          process.env.ACCESS_TOKEN_LIFE,
        );
        const newRefreshToken = await authMethod.generateToken(
          verifyToken.payload,
          process.env.REFRESH_TOKEN_SECRET,
          process.env.REFRESH_TOKEN_LIFE,
        );
        const user = await User.findOneAndUpdate(
          { email: verifyToken.payload.email },
          {
            refreshToken: newRefreshToken,
          },
          {
            new: true,
          },
        );
        if (user) {
          res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            secure: false,
          });
          res.status(status.StatusCodes.CREATED).json({
            success: true,
            data: {
              id: user._id,
              role: user.role,
              accessToken: newAccessToken,
              expireIns: Date.now() + Number.parseInt(process.env.TIMER),
            },
          });
        }
        next();
      }
    } catch (error) {
      res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: {
          message: 'Error from SERVER!',
        },
      });
    }
  }
  async refreshAdmin(req, res, next) {
    try {
      const { refreshTokenAdmin } = req.cookies;
      if (!refreshTokenAdmin) {
        res.status(status.StatusCodes.OK).json({
          remove: true,
        });
      }
      const verifyToken = await authMethod.decodeToken(
        refreshTokenAdmin,
        process.env.REFRESH_TOKEN_SECRET,
      );
      if (verifyToken) {
        const newAccessToken = await authMethod.generateToken(
          verifyToken.payload,
          process.env.ACCESS_TOKEN_SECRET,
          process.env.ACCESS_TOKEN_LIFE,
        );
        const newRefreshToken = await authMethod.generateToken(
          verifyToken.payload,
          process.env.REFRESH_TOKEN_SECRET,
          process.env.REFRESH_TOKEN_LIFE,
        );
        const user = await User.findOneAndUpdate(
          { email: verifyToken.payload.email },
          {
            refreshToken: newRefreshToken,
          },
          {
            new: true,
          },
        );
        if (user) {
          res.cookie('refreshTokenAdmin', newRefreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            secure: false,
          });
          res.status(status.StatusCodes.CREATED).json({
            success: true,
            data: {
              id: user._id,
              role: user.role,
              accessToken: newAccessToken,
              expireIns: Date.now() + Number.parseInt(process.env.TIMER),
            },
          });
        }
        next();
      }
    } catch (error) {
      res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: {
          message: 'Error from SERVER!',
        },
      });
    }
  }
  async verify(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById({ _id: id });
      if (user) {
        res.status(status.StatusCodes.OK).json({
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
      res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: {
          message: 'Error from SERVER!',
        },
      });
    }
  }
  async active(req, res, next) {
    try {
      const { id } = req.params;
      const data = await User.findById({ _id: id });
      const now = Math.floor(Date.now());
      const timeCreated = Math.floor(data.createdAt);
      if (data.isActive) {
        res.status(status.StatusCodes.OK).json({
          success: true,
        });
      } else {
        if (now - timeCreated < 300) {
          await User.deleteOne({ _id: id });
          return res.status(status.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Tài khoản đã hết hạn active.',
          });
        } else {
          const user = await User.findOneAndUpdate(
            { _id: id },
            { isActive: true },
            { new: true },
          );
          res.status(status.StatusCodes.CREATED).json({
            success: true,
            user,
          });
        }
      }
    } catch (error) {
      res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: {
          message: 'Error from SERVER!',
        },
      });
    }
  }
  async forgot(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      const content = `<b>Vui lòng click vào đường link này để xác thực việc lấy lại mật khẩu. <a href="http://localhost:5173/update.html?id=${user._id}">Xác thực</a></b>`;
      if (user) {
        await mailer.sendMail({
          from: 'Ismart admin',
          to: user.email,
          subject: 'Xác thực việc lấy lại mật khẩu tại iSmart ✔',
          text: 'Xác thực việc lấy lại mật khẩu tại iSmart',
          html: content,
        });
        await User.findOneAndUpdate(
          { email },
          { $set: { resetedAt: new Date().getTime() } },
        );
        res.status(status.StatusCodes.OK).json({
          success: true,
          message: 'Kiểm tra email để xác thực',
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có tài khoản nào được tìm thấy.',
        });
      }
    } catch (error) {
      res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: {
          message: 'Error from SERVER!',
        },
      });
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken, refreshTokenAdmin } = req.cookies;
      let user;
      if (refreshToken) {
        user = await User.findOneAndUpdate(
          { refreshToken },
          {
            refreshToken: '',
          },
          {
            new: true,
          },
        );
        if (user) {
          res.clearCookie('refreshToken', { path: '/' });
          res.status(status.StatusCodes.OK).json({
            success: true,
            data: {
              message: 'Logout success!',
            },
          });
        } else {
          return res.status(status.StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Không có tài khoản nào được tìm thấy.',
          });
        }
      } else {
        user = await User.findOneAndUpdate(
          { refreshToken: refreshTokenAdmin },
          {
            refreshToken: '',
          },
          {
            new: true,
          },
        );
        if (user) {
          res.clearCookie('refreshTokenAdmin');
          res.status(status.StatusCodes.OK).json({
            success: true,
            data: {
              message: 'Logout success!',
            },
          });
        } else {
          return res.status(status.StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Không có tài khoản nào được tìm thấy.',
          });
        }
      }
    } catch (error) {
      res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: {
          message: 'Error from SERVER!',
        },
      });
    }
  }
}
module.exports = new UserController();
