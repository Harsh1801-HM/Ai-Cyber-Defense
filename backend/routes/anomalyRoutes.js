const express = require('express');
const router = express.Router();
const { detectAnomalyHandler } = require('../controllers/anomalyController');

router.post('/', detectAnomalyHandler);

module.exports = router;
