const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { analyzeMedia } = require('../services/mediaService');
const { generateExplanation, getRiskLevel } = require('../services/openaiService');
const { processAlert } = require('../services/alertService');
const Threat = require('../models/Threat');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../config/logger');

const analyzeMediaHandler = async (req, res) => {
  const startTime = Date.now();

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { path: filePath, mimetype, originalname, size } = req.file;
  const analysisId = uuidv4();

  logger.info(`[${analysisId}] Analyzing media: ${originalname} (${mimetype}, ${size} bytes)`);

  try {
    // Step 1: Media analysis
    const mediaAnalysis = await analyzeMedia(filePath, mimetype, originalname);

    // Step 2: AI explanation
    const aiExplanation = await generateExplanation({
      type: 'MEDIA',
      input: { fileName: originalname, fileType: mimetype, fileSize: size },
      riskScore: mediaAnalysis.riskScore,
      indicators: mediaAnalysis.indicators,
      threats: mediaAnalysis.threats,
    });

    const riskLevel = getRiskLevel(mediaAnalysis.riskScore);

    // Step 3: Save to MongoDB
    const threat = new Threat({
      type: 'MEDIA',
      input: {
        fileName: originalname,
        fileType: mimetype,
        fileSize: size,
        analysisMethod: mediaAnalysis.analysisMethod,
      },
      riskScore: mediaAnalysis.riskScore,
      riskLevel,
      threatClassification: aiExplanation.threatClassification || 'Media Analysis',
      threatCategories: mediaAnalysis.indicators.map((i) => ({
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
      indicators: mediaAnalysis.indicators,
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
      action: 'ANALYZE_MEDIA',
      threatId: threat._id,
      userIp: req.ip,
      sessionId: req.headers['x-session-id'],
      userAgent: req.headers['user-agent'],
      details: { fileName: originalname, fileType: mimetype, fileSize: size },
      duration: Date.now() - startTime,
    });

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) logger.warn(`Failed to delete temp file: ${filePath}`);
    });

    logger.info(`[${analysisId}] Media analysis complete. Risk: ${mediaAnalysis.riskScore}/100`);

    res.json({
      success: true,
      analysisId,
      type: 'MEDIA',
      fileInfo: {
        name: originalname,
        type: mimetype,
        size,
      },
      riskScore: mediaAnalysis.riskScore,
      riskLevel,
      threatClassification: aiExplanation.threatClassification,
      explanation: {
        summary: aiExplanation.summary,
        details: aiExplanation.details,
        technicalFindings: aiExplanation.technicalFindings,
      },
      indicators: mediaAnalysis.indicators,
      suggestedActions: aiExplanation.suggestedActions,
      analysisMethod: mediaAnalysis.analysisMethod,
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      id: threat._id,
    });

  } catch (error) {
    // Clean up on error
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
    throw error;
  }
};

module.exports = { analyzeMediaHandler };
