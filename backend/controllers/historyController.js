const Threat = require('../models/Threat');
const ActivityLog = require('../models/ActivityLog');
const { acknowledgeAlert, getPendingAlerts } = require('../services/alertService');
const logger = require('../config/logger');

// ─── History Controller ────────────────────────────────────────────────────────

const getHistory = async (req, res) => {
  const { page = 1, limit = 20, type, riskLevel, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {};
  if (type) query.type = type.toUpperCase();
  if (riskLevel) query.riskLevel = riskLevel.toUpperCase();

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [threats, total] = await Promise.all([
    Threat.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-rawAiResponse -__v'),
    Threat.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: threats,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
};

const getThreatById = async (req, res) => {
  const threat = await Threat.findById(req.params.id).select('-rawAiResponse -__v');
  if (!threat) return res.status(404).json({ error: 'Threat not found' });
  res.json({ success: true, data: threat });
};

const getStats = async (req, res) => {
  const stats = await Threat.getStats();

  // Get last 7 days trend
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const trend = await Threat.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        avgRisk: { $avg: '$riskScore' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const recentThreats = await Threat.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('type riskScore riskLevel threatClassification createdAt');

  res.json({
    success: true,
    stats,
    trend,
    recentThreats,
  });
};

const deleteHistory = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Array of IDs required' });
  }
  await Threat.deleteMany({ _id: { $in: ids } });
  res.json({ success: true, deleted: ids.length });
};

// ─── Alerts Controller ─────────────────────────────────────────────────────────

const getAlerts = async (req, res) => {
  const alerts = await getPendingAlerts(50);
  res.json({ success: true, alerts, count: alerts.length });
};

const ackAlert = async (req, res) => {
  const threat = await acknowledgeAlert(req.params.id);
  if (!threat) return res.status(404).json({ error: 'Alert not found' });

  await ActivityLog.create({
    action: 'ALERT_ACK',
    threatId: threat._id,
    userIp: req.ip,
    details: { alertId: req.params.id },
  });

  res.json({ success: true, message: 'Alert acknowledged' });
};

const ackAllAlerts = async (req, res) => {
  const result = await Threat.updateMany(
    { isAlert: true, alertAcknowledged: false },
    { alertAcknowledged: true }
  );
  res.json({ success: true, acknowledged: result.modifiedCount });
};

module.exports = {
  getHistory,
  getThreatById,
  getStats,
  deleteHistory,
  getAlerts,
  ackAlert,
  ackAllAlerts,
};
