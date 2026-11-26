/**
 * URL Service - Heuristic & Pattern Analysis for URLs
 */

async function analyzeUrl(rawUrl) {
  let urlObj;
  try {
    const formatted = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `http://${rawUrl}`;
    urlObj = new URL(formatted);
  } catch (err) {
    urlObj = { hostname: rawUrl, pathname: '', search: '', href: rawUrl };
  }

  const hostname = urlObj.hostname || rawUrl;
  const indicators = [];

  const suspiciousTLDs = ['.xyz', '.top', '.club', '.online', '.site', '.work', '.info', '.cc', '.tk', '.ml', '.ga', '.cf', '.gq', '.zip', '.mov'];
  const hasSuspiciousTLD = suspiciousTLDs.some((tld) => hostname.toLowerCase().endsWith(tld));
  if (hasSuspiciousTLD) {
    indicators.push({
      indicator: 'Suspicious TLD',
      weight: 30,
      description: `Domain uses a high-risk TLD commonly associated with phishing/malware.`,
    });
  }

  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (ipRegex.test(hostname)) {
    indicators.push({
      indicator: 'IP Address as Hostname',
      weight: 40,
      description: 'URL uses raw IP address instead of registered domain name.',
    });
  }

  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    indicators.push({
      indicator: 'Excessive Hyphens',
      weight: 20,
      description: `Domain contains ${hyphenCount} hyphens, a common obfuscation tactic.`,
    });
  }

  const keywords = ['login', 'verify', 'account', 'banking', 'secure', 'update', 'paypal', 'google', 'apple', 'microsoft', 'wallet', 'crypto', 'confirm'];
  const foundKeywords = keywords.filter((kw) => rawUrl.toLowerCase().includes(kw));
  if (foundKeywords.length > 0 && !hostname.endsWith('google.com') && !hostname.endsWith('paypal.com') && !hostname.endsWith('apple.com') && !hostname.endsWith('microsoft.com')) {
    indicators.push({
      indicator: 'Brand Spoofing / Keywords',
      weight: 35,
      description: `URL contains sensitive target keywords: ${foundKeywords.join(', ')}.`,
    });
  }

  if (rawUrl.length > 75) {
    indicators.push({
      indicator: 'Abnormally Long URL',
      weight: 15,
      description: `URL length is ${rawUrl.length} characters (exceeds standard domain length).`,
    });
  }

  if (rawUrl.includes('@')) {
    indicators.push({
      indicator: 'URL Userinfo Obfuscation (@)',
      weight: 50,
      description: 'URL contains "@" character to confuse browser routing.',
    });
  }

  const totalWeight = indicators.reduce((acc, curr) => acc + curr.weight, 0);
  const riskScore = Math.min(totalWeight, 100);

  return {
    riskScore,
    indicators,
    threats: indicators.map((i) => i.indicator),
    parsedComponents: {
      hostname,
      protocol: urlObj.protocol || 'http:',
      pathname: urlObj.pathname || '/',
      search: urlObj.search || '',
    },
  };
}

module.exports = { analyzeUrl };
