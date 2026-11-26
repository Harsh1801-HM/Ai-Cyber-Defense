/**
 * NLP Service - Prompt Injection & Text Cyber Threat Analysis
 */

function analyzeText(text) {
  const indicators = [];
  const lower = text.toLowerCase();

  const promptInjectionPatterns = [
    { pattern: /ignore (all|previous|above) instructions/i, name: 'System Override Attack', weight: 45, desc: 'Attempts to override AI prompt instructions.' },
    { pattern: /you are now DAN|do anything now|jailbreak|developer mode/i, name: 'Jailbreak Attempt', weight: 50, desc: 'Uses known LLM jailbreaking phrases.' },
    { pattern: /system prompt|reveal your instructions|disclose system instructions/i, name: 'System Prompt Extraction', weight: 35, desc: 'Attempts to extract confidential system instructions.' },
    { pattern: /bypass (security|filter|guardrails|safety)/i, name: 'Guardrail Bypass', weight: 40, desc: 'Explicit attempt to bypass system safety filters.' },
  ];

  const socialEngineeringPatterns = [
    { pattern: /urgent action required|account suspended|verify immediately|within 24 hours/i, name: 'Urgency Pressure', weight: 25, desc: 'Employs psychological urgency pressure tactics.' },
    { pattern: /click here to verify|login to claim|transfer funds|gift card|wire transfer/i, name: 'Phishing Call-to-Action', weight: 30, desc: 'Contains high-risk phishing action requests.' },
    { pattern: /password|secret key|ssn|social security|credit card number/i, name: 'Sensitive Data Request', weight: 30, desc: 'Requests confidential credentials or personal data.' },
  ];

  [...promptInjectionPatterns, ...socialEngineeringPatterns].forEach((item) => {
    if (item.pattern.test(text)) {
      indicators.push({
        indicator: item.name,
        weight: item.weight,
        description: item.desc,
      });
    }
  });

  const totalWeight = indicators.reduce((acc, i) => acc + i.weight, 0);
  const riskScore = Math.min(totalWeight, 100);

  const tokens = text.trim().split(/\s+/).filter(Boolean);

  return {
    riskScore,
    indicators,
    threats: indicators.map((i) => i.indicator),
    tokenCount: tokens.length,
  };
}

module.exports = { analyzeText };
