const express = require('express');
const router = express.Router();
const authMethod = require('../auth/AuthController');

const userController = require('../app/controllers/UserController');

router.post('/login', userController.check);

router.get('/auth/refresh', userController.refresh);
// router.get('/auth/refreshAdmin', userController.refreshAdmin);
router.get('/verify/:id', userController.verify);

router.post('/add', authMethod.validatePayload, userController.add);
router.get('/:id', userController.detail);
router.patch('/update/:id', userController.update);
router.get('/', userController.index);

module.exports = router;
