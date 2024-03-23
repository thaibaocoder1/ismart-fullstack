const express = require('express');
const router = express.Router();
const authMethod = require('../auth/AuthController');
const upload = require('../middlewares/multer');

const userController = require('../app/controllers/UserController');

router.post('/login', userController.check);

router.get('/auth/refresh', userController.refresh);
// router.get('/auth/refreshAdmin', userController.refreshAdmin);
router.get('/verify/:id', userController.verify);

router.get('/:id', userController.detail);
router.post(
  '/add',
  authMethod.validatePayload,
  upload.single('imageUrl'),
  userController.add,
);
router.patch('/update/:id', upload.single('imageUrl'), userController.update);
router.get('/', userController.index);

module.exports = router;
