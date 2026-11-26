/**
 * ML Classifier Simulation Service
 * Provides machine learning threat classification probabilities and feature contributions.
 */

function analyzeUrlWithML(url) {
  let score = 0;
  const topFeatures = [];

  if (url.length > 50) {
    score += 25;
    topFeatures.push({ feature: 'URL Length > 50', weight: 0.25 });
  }
  if (/[0-9]{1,3}\.[0-9]{1,3}/.test(url)) {
    score += 40;
    topFeatures.push({ feature: 'IP Pattern in Hostname', weight: 0.4 });
  }
  if (url.split('.').length > 3) {
    score += 20;
    topFeatures.push({ feature: 'Subdomain Depth > 3', weight: 0.2 });
  }
  if (/@|\$|%/.test(url)) {
    score += 15;
    topFeatures.push({ feature: 'Special Character Density', weight: 0.15 });
  }

  const mlScore = Math.min(score, 99);
  const prediction = mlScore >= 60 ? 'Phishing' : mlScore >= 30 ? 'Suspicious' : 'Safe';
  const confidence = Math.max(mlScore / 100, 0.65);

  return { mlScore, prediction, confidence, topFeatures };
}

function analyzeTextWithML(text) {
  let score = 0;
  const topFeatures = [];

  if (/ignore|bypass|jailbreak|DAN/i.test(text)) {
    score += 55;
    topFeatures.push({ feature: 'LLM Control Token Match', weight: 0.55 });
  }
  if (/password|key|token|credential|secret/i.test(text)) {
    score += 30;
    topFeatures.push({ feature: 'Credential Keyword Proximity', weight: 0.30 });
  }
  if (text.length > 500) {
    score += 10;
    topFeatures.push({ feature: 'High Token Volume', weight: 0.10 });
  }

  const mlScore = Math.min(score, 99);
  const prediction = mlScore >= 60 ? 'Malicious' : mlScore >= 30 ? 'Suspicious' : 'Safe';
  const confidence = Math.max(mlScore / 100, 0.70);

  return { mlScore, prediction, confidence, topFeatures };
}

function analyzeMediaWithML(metadata) {
  return { mlScore: 35, prediction: 'Suspicious', confidence: 0.78, topFeatures: [{ feature: 'Facial Boundary Artifacts', weight: 0.35 }] };
}

function detectAnomalyWithML(data) {
  return { mlScore: 40, prediction: 'Outlier Present', confidence: 0.82, topFeatures: [{ feature: 'Distribution Shift', weight: 0.40 }] };
}

module.exports = {
  analyzeUrlWithML,
  analyzeTextWithML,
  analyzeMediaWithML,
  detectAnomalyWithML,
};
