const { v4: uuidv4 } = require('uuid');
const { analyzeUrl } = require('../services/urlService');
const { analyzeUrlWithML } = require('../services/mlService');
const { computeRiskScore } = require('../services/scoringService');
const { generateExplanation, getRiskLevel } = require('../services/openaiService');
const { processAlert } = require('../services/alertService');
const Threat = require('../models/Threat');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../config/logger');

const analyzeUrlHandler = async (req, res) => {
  const startTime = Date.now();
  const { url } = req.body;

  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const analysisId = uuidv4();
  logger.info(`[${analysisId}] Analyzing URL: ${url.substring(0, 100)}`);

  // Step 1: Heuristic URL analysis (pattern-based)
  const urlAnalysis = await analyzeUrl(url.trim());

  // Step 2: ML prediction (Naive Bayes)
  const mlResult = analyzeUrlWithML(url.trim());

  // Step 3: Combined weighted risk scoring
  const scoring = computeRiskScore({
    mlScore: mlResult.mlScore,
    mlPrediction: mlResult.prediction,
    mlTopFeatures: mlResult.topFeatures,
    patternScore: urlAnalysis.riskScore,
    patternReasons: urlAnalysis.indicators.map((i) => i.description),
    input: url.trim(),
  });

  // Step 4: AI explanation (uses mock if no OpenAI key)
  const aiExplanation = await generateExplanation({
    type: 'URL',
    input: { url },
    riskScore: scoring.riskScore,
    indicators: urlAnalysis.indicators,
    threats: urlAnalysis.threats,
  });

  const riskLevel = getRiskLevel(scoring.riskScore);

  // Step 5: Save to MongoDB with full XAI data
  const threat = new Threat({
    type: 'URL',
    input: { url },
    riskScore: scoring.riskScore,
    riskLevel,
    threatClassification: scoring.threatType,
    threatCategories: urlAnalysis.indicators.map((i) => ({
      name: i.indicator,
      confidence: i.weight / 100,
      description: i.description,
    })),
    explanation: {
      summary: aiExplanation.summary,
      details: aiExplanation.details || [],
      technicalFindings: aiExplanation.technicalFindings || [],
    },
    suggestedActions: aiExplanation.suggestedActions || [],
    indicators: urlAnalysis.indicators,
    metadata: {
      processingTime: Date.now() - startTime,
      modelVersion: '2.0.0',
      analysisId,
    },
    userIp: req.ip,
    sessionId: req.headers['x-session-id'] || 'anonymous',
  });

  await threat.save();

  // Step 6: Real-time alert if risk > 70
  const io = req.app.get('io');
  await processAlert(threat, io);

  await ActivityLog.create({
    action: 'ANALYZE_URL',
    threatId: threat._id,
    userIp: req.ip,
    sessionId: req.headers['x-session-id'],
    userAgent: req.headers['user-agent'],
    details: { url: url.substring(0, 100) },
    duration: Date.now() - startTime,
  });

  logger.info(`[${analysisId}] URL analysis complete. Risk: ${scoring.riskScore}/100 (${scoring.threatType})`);

  res.json({
    success: true,
    analysisId,
    type: 'URL',
    input: { url },
    riskScore: scoring.riskScore,
    riskLevel,
    threatType: scoring.threatType,           // 'Safe' | 'Suspicious' | 'Phishing'
    reasons: scoring.reasons,                  // XAI: WHY is it risky?
    breakdown: scoring.breakdown,              // Score breakdown by component
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
    indicators: urlAnalysis.indicators,
    suggestedActions: aiExplanation.suggestedActions,
    parsedComponents: urlAnalysis.parsedComponents,
    processingTime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    id: threat._id,
  });
};

module.exports = { analyzeUrlHandler };
