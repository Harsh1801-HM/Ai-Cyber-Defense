/**
 * OpenAI / Explainable AI (XAI) Service
 * Generates human-understandable AI summaries, technical breakdowns, and suggested mitigations.
 */

function getRiskLevel(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

async function generateExplanation({ type, input, riskScore, indicators = [], threats = [] }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== 'sk-your-openai-key-here' && apiKey.startsWith('sk-')) {
    try {
      const axios = require('axios');
      const prompt = `You are a Senior Cyber Defense Analyst AI. Analyze the following scan result:
Type: ${type}
Input: ${JSON.stringify(input)}
Risk Score: ${riskScore}/100
Detected Indicators: ${JSON.stringify(indicators)}

Provide a concise JSON response with key fields:
- summary: A clear 2-sentence executive summary of the threat level.
- details: Array of key findings explaining WHY it is safe or dangerous.
- technicalFindings: Technical details (IPs, TLDs, entropy, injection patterns, etc.).
- suggestedActions: Recommended mitigation steps for security team.
- threatClassification: The threat category name.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('OpenAI API call failed or misconfigured, using fallback XAI engine:', err.message);
    }
  }

  // Smart Rule-Based Fallback XAI Engine
  const level = getRiskLevel(riskScore);
  const indicatorNames = indicators.map((i) => i.indicator || i.name).join(', ') || 'None';

  let summary = `Analysis complete for ${type} input. Overall risk score is ${riskScore}/100 (${level} Risk).`;
  if (level === 'HIGH') {
    summary = `CRITICAL WARNING: High-risk threat detected in ${type} scan (Score: ${riskScore}/100). Malicious indicators found: ${indicatorNames}.`;
  } else if (level === 'MEDIUM') {
    summary = `ATTENTION REQUIRED: Moderate risk detected in ${type} scan (Score: ${riskScore}/100). Suspicious indicators: ${indicatorNames}.`;
  } else {
    summary = `SAFE: No high-severity threats detected in ${type} scan (Score: ${riskScore}/100). Input appears legitimate.`;
  }

  const details = indicators.length > 0
    ? indicators.map((i) => `${i.indicator || 'Indicator'}: ${i.description || 'Elevated risk factor detected.'}`)
    : ['Standard structural parameters passed without red flags.'];

  const technicalFindings = [
    `Evaluation Engine: Rule-Based XAI + ML Hybrid Vector Analysis`,
    `Scan Type: ${type}`,
    `Indicators Triggered: ${indicators.length}`,
    `Calculated Threat Level: ${level}`,
  ];

  const suggestedActions = level === 'HIGH'
    ? ['Block request or domain immediately at firewall/gateway.', 'Isolate user session and alert SOC team.', 'Do not execute or click links.']
    : level === 'MEDIUM'
    ? ['Log transaction for audit.', 'Apply secondary validation or CAPTCHA.', 'Inspect payload headers.']
    : ['No immediate action required.', 'Standard logging applied.'];

  return {
    summary,
    details,
    technicalFindings,
    suggestedActions,
    threatClassification: level === 'HIGH' ? 'High Risk Threat' : level === 'MEDIUM' ? 'Suspicious Activity' : 'Benign / Safe',
  };
}

module.exports = { generateExplanation, getRiskLevel };
