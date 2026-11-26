const express = require('express');
const router = express.Router();
const { analyzeTextHandler } = require('../controllers/textController');

router.post('/', analyzeTextHandler);

module.exports = router;
