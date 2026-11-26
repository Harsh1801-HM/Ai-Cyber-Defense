const { v4: uuidv4 } = require('uuid');
const { detectAnomaly } = require('../services/anomalyService');
const { generateExplanation, getRiskLevel } = require('../services/openaiService');
const { processAlert } = require('../services/alertService');
const Threat = require('../models/Threat');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../config/logger');

const detectAnomalyHandler = async (req, res) => {
  const startTime = Date.now();
  const { data, label } = req.body;

  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Data array is required' });
  }

  if (data.length < 3) {
    return res.status(400).json({ error: 'Minimum 3 data points required' });
  }

  if (data.length > 10000) {
    return res.status(400).json({ error: 'Maximum 10,000 data points allowed' });
  }

  const analysisId = uuidv4();
  logger.info(`[${analysisId}] Anomaly detection on ${data.length} data points`);

  // Step 1: Anomaly detection
  const anomalyAnalysis = detectAnomaly(data);

  // Step 2: AI explanation
  const aiExplanation = await generateExplanation({
    type: 'ANOMALY',
    input: {
      dataPoints: data.length,
      label: label || 'Unnamed Dataset',
      stats: anomalyAnalysis.stats,
    },
    riskScore: anomalyAnalysis.riskScore,
    indicators: anomalyAnalysis.indicators,
    threats: anomalyAnalysis.threats,
  });

  const riskLevel = getRiskLevel(anomalyAnalysis.riskScore);

  // Step 3: Save to MongoDB
  const threat = new Threat({
    type: 'ANOMALY',
    input: {
      dataPoints: data.length,
      label: label || 'Unnamed Dataset',
      dataSample: data.slice(0, 20), // Store only first 20 points
    },
    riskScore: anomalyAnalysis.riskScore,
    riskLevel,
    threatClassification: aiExplanation.threatClassification || 'Anomaly Detection',
    threatCategories: anomalyAnalysis.indicators.map((i) => ({
      name: i.indicator,
      confidence: Math.min(i.weight / 100, 1),
      description: i.description,
    })),
    explanation: {
      summary: aiExplanation.summary,
      details: aiExplanation.details || [],
      technicalFindings: aiExplanation.technicalFindings || [],
    },
    suggestedActions: aiExplanation.suggestedActions || [],
    indicators: anomalyAnalysis.indicators,
    metadata: {
      processingTime: Date.now() - startTime,
      modelVersion: '1.0.0',
      analysisId,
    },
    userIp: req.ip,
    sessionId: req.headers['x-session-id'] || 'anonymous',
  });

  await threat.save();

  const io = req.app.get('io');
  await processAlert(threat, io);

  await ActivityLog.create({
    action: 'DETECT_ANOMALY',
    threatId: threat._id,
    userIp: req.ip,
    sessionId: req.headers['x-session-id'],
    userAgent: req.headers['user-agent'],
    details: { dataPoints: data.length, label },
    duration: Date.now() - startTime,
  });

  logger.info(`[${analysisId}] Anomaly detection complete. Risk: ${anomalyAnalysis.riskScore}/100`);

  res.json({
    success: true,
    analysisId,
    type: 'ANOMALY',
    label: label || 'Unnamed Dataset',
    riskScore: anomalyAnalysis.riskScore,
    riskLevel,
    threatClassification: aiExplanation.threatClassification,
    explanation: {
      summary: aiExplanation.summary,
      details: aiExplanation.details,
      technicalFindings: aiExplanation.technicalFindings,
    },
    indicators: anomalyAnalysis.indicators,
    suggestedActions: aiExplanation.suggestedActions,
    stats: anomalyAnalysis.stats,
    processingTime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    id: threat._id,
  });
};

module.exports = { detectAnomalyHandler };
