const express = require('express');
const router = express.Router();
const authMethod = require('../auth/AuthController');

const userController = require('../app/controllers/UserController');

router.post('/login', userController.check);
router.post('/add', authMethod.validatePayload, userController.add);
router.get('/:id', userController.detail);
router.get('/', userController.index);

module.exports = router;
