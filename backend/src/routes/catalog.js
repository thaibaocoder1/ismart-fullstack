const express = require('express');
const router = express.Router();

const catalogController = require('../app/controllers/CatalogController');

router.get('/', catalogController.index);

module.exports = router;
