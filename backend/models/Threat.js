const mongoose = require('mongoose');

const ThreatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['URL', 'TEXT', 'MEDIA', 'ANOMALY'],
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  riskLevel: {
    type: String,
    enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true,
  },
  threatClassification: {
    type: String,
    required: true,
  },
  threatCategories: [{
    name: String,
    confidence: Number,
    description: String,
  }],
  explanation: {
    summary: String,
    details: [String],
    technicalFindings: [String],
  },
  suggestedActions: [String],
  indicators: [{
    indicator: String,
    weight: Number,
    description: String,
  }],
  metadata: {
    processingTime: Number,
    modelVersion: String,
    analysisId: String,
  },
  rawAiResponse: String,
  isAlert: {
    type: Boolean,
    default: false,
  },
  alertAcknowledged: {
    type: Boolean,
    default: false,
  },
  userIp: String,
  sessionId: String,
}, {
  timestamps: true,
});

// Index for faster queries
ThreatSchema.index({ createdAt: -1 });
ThreatSchema.index({ riskScore: -1 });
ThreatSchema.index({ type: 1 });
ThreatSchema.index({ isAlert: 1, alertAcknowledged: 1 });

// Virtual for age
ThreatSchema.virtual('age').get(function () {
  return Date.now() - this.createdAt;
});

// Static method to get stats
ThreatSchema.statics.getStats = async function () {
  const total = await this.countDocuments();
  const byType = await this.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 }, avgRisk: { $avg: '$riskScore' } } },
  ]);
  const byLevel = await this.aggregate([
    { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
  ]);
  const recentAlerts = await this.countDocuments({
    isAlert: true,
    alertAcknowledged: false,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  const avgRiskScore = await this.aggregate([
    { $group: { _id: null, avg: { $avg: '$riskScore' } } },
  ]);

  return { total, byType, byLevel, recentAlerts, avgRiskScore: avgRiskScore[0]?.avg || 0 };
};

module.exports = mongoose.model('Threat', ThreatSchema);
