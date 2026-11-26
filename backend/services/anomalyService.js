/**
 * Anomaly Detection Service - Statistical & Outlier Analysis
 */

function detectAnomaly(dataArray) {
  const numericData = dataArray.map((v) => Number(v)).filter((v) => !isNaN(v));

  if (numericData.length === 0) {
    return {
      riskScore: 0,
      indicators: [],
      threats: [],
      stats: { mean: 0, stdDev: 0, min: 0, max: 0, outliersCount: 0 },
    };
  }

  const n = numericData.length;
  const mean = numericData.reduce((a, b) => a + b, 0) / n;
  const variance = numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Identify Z-score outliers (|Z| > 2.5)
  const zScoreThreshold = 2.5;
  const outliers = numericData.filter((v) => stdDev > 0 && Math.abs((v - mean) / stdDev) > zScoreThreshold);

  const outlierRatio = outliers.length / n;
  let riskScore = Math.min(Math.round(outlierRatio * 250 + (outliers.length > 0 ? 30 : 0)), 100);

  const indicators = [];
  if (outliers.length > 0) {
    indicators.push({
      indicator: 'Statistical Outliers Detected',
      weight: Math.min(outliers.length * 15, 60),
      description: `Detected ${outliers.length} data point(s) exceeding ${zScoreThreshold} standard deviations from mean.`,
    });
  }

  if (stdDev / (mean || 1) > 1.5) {
    indicators.push({
      indicator: 'High Variance Anomaly',
      weight: 25,
      description: 'Coefficient of variation indicates extreme dispersion in input dataset.',
    });
  }

  return {
    riskScore,
    indicators,
    threats: indicators.map((i) => i.indicator),
    stats: {
      count: n,
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min: Math.min(...numericData),
      max: Math.max(...numericData),
      outliersCount: outliers.length,
      outlierValues: outliers.slice(0, 5),
    },
  };
}

module.exports = { detectAnomaly };
