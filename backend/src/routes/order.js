const express = require('express');
const router = express.Router();

const orderController = require('../app/controllers/OrderController');

router.delete('/delete/:id', orderController.delete);
router.post('/add', orderController.add);
router.get('/', orderController.index);

module.exports = router;
