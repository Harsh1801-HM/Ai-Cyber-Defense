const express = require('express');
const router = express.Router();
const {
  getHistory,
  getThreatById,
  getStats,
  deleteHistory,
} = require('../controllers/historyController');

router.get('/', getHistory);
router.get('/stats', getStats);
router.get('/:id', getThreatById);
router.delete('/', deleteHistory);

module.exports = router;
