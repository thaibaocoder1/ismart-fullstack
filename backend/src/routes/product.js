const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');

const productController = require('../app/controllers/ProductController');

router.get('/detail/:id', productController.detail);
router.get('/:slug', productController.slug);

router.post('/add', upload.single('imageUrl'), productController.add);
router.patch('/update/:id', upload.single('thumb'), productController.update);
router.patch(
  '/update-order/:id',
  upload.single('thumb'),
  productController.updateOrder,
);

router.get('/', productController.index);

module.exports = router;
