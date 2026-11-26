const express = require('express');
const router = express.Router();
const { analyzeUrlHandler } = require('../controllers/urlController');

router.post('/', analyzeUrlHandler);

module.exports = router;
