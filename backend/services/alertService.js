/**
 * Alert Service for Real-time Socket.IO Notifications & Storage
 */

const Threat = require('../models/Threat');
const logger = require('../config/logger');

async function processAlert(threat, io) {
  const threshold = parseInt(process.env.ALERT_RISK_THRESHOLD) || 70;

  if (threat.riskScore >= threshold) {
    threat.isAlert = true;
    threat.alertAcknowledged = false;
    await threat.save();

    if (io) {
      const alertPayload = {
        id: threat._id,
        type: threat.type,
        riskScore: threat.riskScore,
        riskLevel: threat.riskLevel,
        threatClassification: threat.threatClassification,
        summary: threat.explanation?.summary,
        timestamp: threat.createdAt || new Date().toISOString(),
      };

      io.to('alerts-room').emit('new-alert', alertPayload);
      logger.info(`🚨 Real-time alert emitted for threat [${threat._id}] (Score: ${threat.riskScore})`);
    }
  }
}

async function getPendingAlerts(limit = 50) {
  return await Threat.find({ isAlert: true, alertAcknowledged: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-rawAiResponse -__v');
}

async function acknowledgeAlert(threatId) {
  return await Threat.findByIdAndUpdate(
    threatId,
    { alertAcknowledged: true },
    { new: true }
  );
}

module.exports = {
  processAlert,
  getPendingAlerts,
  acknowledgeAlert,
};
