const User = require('../models/User');
const { mongooseObject } = require('../../utils');
const jwt = require('jsonwebtoken');

class AccountController {
  async index(req, res, next) {
    try {
      const secretToken = process.env.ACCESS_TOKEN_SECRET;
      const accessToken = req.cookies.accessToken;
      const verify = jwt.verify(accessToken, secretToken);
      console.log(req.cookies.accessToken);
      console.log(verify);
      if (verify) {
        const user = await User.findOne({ email: verify.payload.email });
        res.render('account', {
          isLogin: true,
          user: mongooseObject(user),
        });
      } else {
        res.render('account', {
          isLogin: false,
        });
      }
    } catch (error) {
      res.redirect('/login');
      next();
    }
  }
  async logout(req, res, next) {
    const secretToken = process.env.ACCESS_TOKEN_SECRET;
    const accessToken = req.cookies.accessToken;
    try {
      const verify = jwt.verify(accessToken, secretToken);
      if (verify) {
        await User.findOneAndUpdate(
          {
            email: verify.payload.email,
          },
          { refreshToken: '' },
        );
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.redirect('/login');
      } else {
        res.json({ token: 'Khong hop le' });
      }
    } catch (error) {
      return res.sendStatus(403);
    }
  }
  change(req, res, next) {
    const userEmail = req.user.email;
    console.log(req.user);
    const isLogin = userEmail ? true : false;
    res.render('change', {
      isLogin,
    });
  }
}
module.exports = new AccountController();
