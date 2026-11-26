const express = require('express');
const router = express.Router();
const {
  getAlerts,
  ackAlert,
  ackAllAlerts,
} = require('../controllers/historyController');

router.get('/', getAlerts);
router.post('/ack-all', ackAllAlerts);
router.post('/:id/ack', ackAlert);

module.exports = router;
