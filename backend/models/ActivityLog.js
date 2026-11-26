const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['ANALYZE_URL', 'ANALYZE_TEXT', 'ANALYZE_MEDIA', 'DETECT_ANOMALY', 'ALERT_ACK', 'VIEW_HISTORY'],
  },
  threatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat',
  },
  userIp: String,
  sessionId: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed,
  duration: Number, // ms
}, {
  timestamps: true,
});

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
