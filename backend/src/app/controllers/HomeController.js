const Product = require('../models/Product');
const Catalog = require('../models/Catalog');
const User = require('../models/User');
const { multipleMongooseObject, shuffle } = require('../../utils');
const authMethod = require('../../auth/AuthController');
const randToken = require('rand-token');
const jwt = require('jsonwebtoken');

class HomeController {
  // index(req, res, next) {
  //   Promise.all([
  //     Product.find().populate({
  //       path: 'categoryID',
  //       match: { title: 'Điện thoại' },
  //     }),
  //     Product.find().populate({
  //       path: 'categoryID',
  //       match: { title: 'Laptop' },
  //     }),
  //     Catalog.find({}),
  //     Product.find({}),
  //   ])
  //     .then(([listPhone, listLaptop, listCategory, listProduct]) => {
  //       let productPhone = [...listPhone].slice(0, 8);
  //       let productLaptop = [...listLaptop].slice(0, 8);
  //       let productShuffle = shuffle(listProduct).slice(0, 6);
  //       productPhone = multipleMongooseObject(productPhone);
  //       productLaptop = multipleMongooseObject(productLaptop);
  //       productShuffle = multipleMongooseObject(productShuffle);
  //       listCategory = multipleMongooseObject(listCategory);
  //       res.render('home', {
  //         productPhone,
  //         productLaptop,
  //         listCategory,
  //         productShuffle,
  //       });
  //     })
  //     .catch(next);
  // }
  // register(req, res, next) {
  //   res.render('register');
  // }
  // async init(req, res, next) {
  //   const { email, phone, password, password_confirmation } = req.body;
  //   const user = await User.findOne({ email: email });
  //   if (user) {
  //     return res.status(409).send({
  //       error: 'Missing Request',
  //       message: 'Account already exists.',
  //     });
  //   } else {
  //     if (!email || !phone) {
  //       return res.status(400).json({
  //         error: 'Bad Request',
  //         message: "Missing required information: 'email or phone'",
  //       });
  //     }
  //     if (password !== password_confirmation) {
  //       return res.status(400).json({
  //         error: 'Bad Request',
  //         message: 'Password is not match with re-password',
  //       });
  //     }
  //     User.create(req.body)
  //       .then((data) => {
  //         if (data) {
  //           res
  //             .status(201)
  //             .json({ status: 'Success', message: 'Created user' });
  //         } else {
  //           res.status(500).json({ message: 'Internal Server Error' });
  //         }
  //       })
  //       .catch(next);
  //   }
  // }
  // login(req, res, next) {
  //   res.render('login');
  // }
  // async check(req, res, next) {
  //   try {
  //     const { email, password } = req.body;
  //     const user = await User.findOne({ email: email });
  //     if (!user) {
  //       return res.status(401).send('Email không tồn tại.');
  //     }
  //     const isPasswordValid = user.password === password;
  //     if (!isPasswordValid) {
  //       return res.status(401).send('Mật khẩu không chính xác.');
  //     }
  //     if (!email || !password) {
  //       return res.status(400).json({
  //         error: 'Bad Request',
  //         message: "Missing required information: 'email or password'",
  //       });
  //     }
  //     const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
  //     const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  //     const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  //     const dataForAccessToken = {
  //       email: user.email,
  //     };
  //     const accessToken = await authMethod.generateToken(
  //       dataForAccessToken,
  //       accessTokenSecret,
  //       accessTokenLife,
  //     );
  //     if (!accessToken) {
  //       return res
  //         .status(401)
  //         .send('Đăng nhập không thành công, vui lòng thử lại.');
  //     }
  //     let refreshToken = await authMethod.generateToken(
  //       dataForAccessToken,
  //       refreshTokenSecret,
  //       process.env.REFRESH_TOKEN_LIFE,
  //     );
  //     if (!user.refreshToken) {
  //       await User.findOneAndUpdate(
  //         { email: email },
  //         { refreshToken: refreshToken },
  //       );
  //     } else {
  //       refreshToken = user.refreshToken;
  //     }
  //     if (refreshToken && accessToken) {
  //       res.cookie('accessToken', accessToken, { maxAge: 5 * 60 * 1000 });
  //       res.cookie('refreshToken', refreshToken);
  //       return res.status(201).json({ accessToken, refreshToken });
  //     } else {
  //       return res.status(401).json({
  //         success: false,
  //         message: 'Not found apply user',
  //       });
  //     }
  //   } catch (error) {
  //     return res.status(500).send('Error');
  //   }
  // }
  // admin(req, res, next) {
  //   res.render('home');
  // }
}
module.exports = new HomeController();
