const Product = require('../models/Product');
const Catalog = require('../models/Catalog');
const User = require('../models/User');
const { multipleMongooseObject, mongooseObject } = require('../../utils');

class AdminController {
  async index(req, res, next) {
    try {
      // const { email } = req.user;
      // const user = await User.findOne({ email: email });
      // if (user) {
      //   const { role } = user;
      //   if (role === 'User') {
      //     res.render('auth/login');
      //   } else {
      //   }
      // }
      res.render('home');
    } catch (error) {
      next(error);
    }
  }
  // Product
  async products(req, res, next) {
    if (req.query.catalogs) {
      const slugCategory = req.query.catalogs;
      const catalog = await Catalog.findOne({ slug: slugCategory });
      const catalogID = catalog._id;
      const products = await Product.find({ categoryID: catalogID }).sort(
        '-updatedAt',
      );
      const catalogs = await Catalog.find({});
      const counted = await Product.find({
        categoryID: catalogID,
      }).countDocuments();
      res.render('product/view', {
        products: multipleMongooseObject(products),
        counted,
        catalogs: multipleMongooseObject(catalogs),
        slugCategory,
      });
    } else {
      Promise.all([
        Product.find({}).sort('-updatedAt'),
        Product.countDocuments(),
        Catalog.find({}),
      ])
        .then(([products, counted, catalogs]) => {
          res.render('product/view', {
            products: multipleMongooseObject(products),
            counted,
            catalogs: multipleMongooseObject(catalogs),
          });
        })
        .catch(next);
    }
  }
  productEdit(req, res, next) {
    Promise.all([
      Product.findById({ _id: req.params.id }).populate('categoryID'),
      Catalog.find(),
    ])
      .then(([product, listCategory]) => {
        res.render('product/edit', {
          product: mongooseObject(product),
          listCategory: multipleMongooseObject(listCategory),
        });
      })
      .catch(next);
  }
  productCreate(req, res, next) {
    Promise.all([Catalog.find()])
      .then(([listCategory]) => {
        res.render('product/create', {
          listCategory: multipleMongooseObject(listCategory),
        });
      })
      .catch(next);
  }
  productAdd(req, res, next) {
    req.body.thumb = {
      data: req.file.originalname,
      contentType: req.file.mimetype,
      fileName: req.file.originalname,
    };
    try {
      Product.create(req.body)
        .then(() => {
          res.status(201).json({
            status: 'success',
            message: 'Create successfully',
          });
        })
        .catch(next);
    } catch (error) {
      next(error);
    }
  }
  async productUpdate(req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!req.file) {
        if (JSON.stringify(req.body) !== JSON.stringify(product.toObject())) {
          await Product.findByIdAndUpdate({ _id: req.params.id }, req.body);
        }
      } else {
        req.body.thumb = {
          data: req.file.originalname,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        };
        await Product.findByIdAndUpdate({ _id: req.params.id }, req.body);
      }
      res.status(201).json({
        status: 'success',
        message: 'Update successfully',
      });
    } catch (error) {
      res.status(500).send('Lỗi khi xử lý request.');
    }
  }
  // Category
  category(req, res, next) {
    Promise.all([Catalog.find(), Catalog.countDocuments()]).then(
      ([listCategory, counted]) => {
        res.render('category/view', {
          listCategory: multipleMongooseObject(listCategory),
          counted,
        });
      },
    );
  }
  categoryEdit(req, res, next) {
    Promise.all([Catalog.findById({ _id: req.params.id })])
      .then(([category]) => {
        res.render('category/edit', {
          category: mongooseObject(category),
        });
      })
      .catch(next);
  }
  categoryUpdate(req, res, next) {
    Catalog.updateOne({ _id: req.params.id }, req.body)
      .then(() => {
        return res.send(201).json({
          status: 'success',
          message: 'Update successfully',
        });
      })
      .catch(next);
  }
  categoryAdd(req, res, next) {
    res.render('category/add');
  }
  categoryStore(req, res, next) {
    Catalog.create(req.body)
      .then(() => {
        return res.send(201).json({
          status: 'success',
          message: 'Created successfully',
        });
      })
      .catch(next);
  }
  categoryDelete(req, res, next) {
    Catalog.deleteOne({ _id: req.params.id })
      .then(() => {
        res.redirect('/admin/category');
      })
      .catch(next);
  }
  // Account
  account(req, res, next) {
    res.render('account/home');
  }
  // User
  async user(req, res, next) {
    try {
      const users = await User.find({}).sort('-updatedAt');
      if (users) {
        res.render('user/home', {
          users: multipleMongooseObject(users),
        });
      }
    } catch (error) {
      next(error);
    }
  }
  userEdit(req, res, next) {
    res.render('user/edit');
  }
}
module.exports = new AdminController();
