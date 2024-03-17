const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');

const productController = require('../app/controllers/ProductController');

router.get('/detail/:id', productController.detail);
router.get('/:slug', productController.slug);
router.post('/add', upload.single('thumb'), productController.add);
router.get('/', productController.index);

module.exports = router;
