const { v4: uuidv4 } = require('uuid');
const { analyzeText } = require('../services/nlpService');
const { analyzeTextWithML } = require('../services/mlService');
const { computeRiskScore } = require('../services/scoringService');
const { generateExplanation, getRiskLevel } = require('../services/openaiService');
const { processAlert } = require('../services/alertService');
const Threat = require('../models/Threat');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../config/logger');

const analyzeTextHandler = async (req, res) => {
  const startTime = Date.now();
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }
  if (text.length > 50000) {
    return res.status(400).json({ error: 'Text exceeds maximum length of 50,000 characters' });
  }

  const analysisId = uuidv4();
  logger.info(`[${analysisId}] Analyzing text (${text.length} chars)`);

  // Step 1: NLP pattern analysis
  const nlpAnalysis = analyzeText(text);

  // Step 2: ML prediction
  const mlResult = analyzeTextWithML(text);

  // Step 3: Combined weighted scoring
  const scoring = computeRiskScore({
    mlScore: mlResult.mlScore,
    mlPrediction: mlResult.prediction,
    mlTopFeatures: mlResult.topFeatures,
    patternScore: nlpAnalysis.riskScore,
    patternReasons: nlpAnalysis.indicators.map((i) => i.description),
    input: text.substring(0, 500),
  });

  // Step 4: AI explanation
  const aiExplanation = await generateExplanation({
    type: 'TEXT',
    input: { textPreview: text.substring(0, 200) },
    riskScore: scoring.riskScore,
    indicators: nlpAnalysis.indicators,
    threats: nlpAnalysis.threats,
  });

  const riskLevel = getRiskLevel(scoring.riskScore);

  // Step 5: Save to MongoDB
  const threat = new Threat({
    type: 'TEXT',
    input: { textPreview: text.substring(0, 500), textLength: text.length },
    riskScore: scoring.riskScore,
    riskLevel,
    threatClassification: scoring.threatType,
    threatCategories: nlpAnalysis.indicators.map((i) => ({
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
    indicators: nlpAnalysis.indicators,
    metadata: {
      processingTime: Date.now() - startTime,
      modelVersion: '2.0.0',
      analysisId,
    },
    userIp: req.ip,
    sessionId: req.headers['x-session-id'] || 'anonymous',
  });

  await threat.save();

  const io = req.app.get('io');
  await processAlert(threat, io);

  await ActivityLog.create({
    action: 'ANALYZE_TEXT',
    threatId: threat._id,
    userIp: req.ip,
    sessionId: req.headers['x-session-id'],
    userAgent: req.headers['user-agent'],
    details: { textLength: text.length },
    duration: Date.now() - startTime,
  });

  logger.info(`[${analysisId}] Text analysis complete. Risk: ${scoring.riskScore}/100 (${scoring.threatType})`);

  res.json({
    success: true,
    analysisId,
    type: 'TEXT',
    riskScore: scoring.riskScore,
    riskLevel,
    threatType: scoring.threatType,
    reasons: scoring.reasons,
    breakdown: scoring.breakdown,
    mlResult: {
      prediction: mlResult.prediction,
      confidence: mlResult.confidence,
      mlScore: mlResult.mlScore,
      topFeatures: mlResult.topFeatures,
    },
    threatClassification: scoring.threatType,
    explanation: {
      summary: aiExplanation.summary,
      details: aiExplanation.details,
      technicalFindings: aiExplanation.technicalFindings,
    },
    indicators: nlpAnalysis.indicators,
    suggestedActions: aiExplanation.suggestedActions,
    nlpStats: { tokenCount: nlpAnalysis.tokenCount, textLength: text.length },
    processingTime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    id: threat._id,
  });
};

module.exports = { analyzeTextHandler };
