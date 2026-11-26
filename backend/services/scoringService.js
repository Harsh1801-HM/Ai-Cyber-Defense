/**
 * Scoring Service for AI Cyber Defense System
 * Combines pattern heuristic scores with ML scores to calculate final risk score (0-100).
 */

function computeRiskScore({ mlScore = 0, mlPrediction = 'Safe', mlTopFeatures = [], patternScore = 0, patternReasons = [], input = '' }) {
  // 60% pattern heuristics + 40% ML scoring
  const combined = Math.round(patternScore * 0.6 + mlScore * 0.4);
  const finalScore = Math.min(Math.max(combined, 0), 100);

  let threatType = 'Safe';
  if (finalScore >= 70) {
    threatType = 'Phishing';
  } else if (finalScore >= 40) {
    threatType = 'Suspicious';
  }

  const reasons = [...patternReasons];
  if (mlPrediction !== 'Safe') {
    reasons.push(`ML Classifier flagged input as ${mlPrediction} (Confidence: ${mlScore}%)`);
  }

  return {
    riskScore: finalScore,
    threatType,
    reasons,
    breakdown: {
      patternScore,
      mlScore,
      weightedPattern: Math.round(patternScore * 0.6),
      weightedMl: Math.round(mlScore * 0.4),
    },
  };
}

module.exports = { computeRiskScore };
