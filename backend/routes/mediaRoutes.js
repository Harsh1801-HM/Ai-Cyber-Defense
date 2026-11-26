const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { analyzeMediaHandler } = require('../controllers/mediaController');

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

router.post('/', upload.single('media'), analyzeMediaHandler);

module.exports = router;
