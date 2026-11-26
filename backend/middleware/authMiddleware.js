/**
 * authMiddleware.js — Protect routes with JWT
 * Usage: router.get('/protected', authMiddleware, handler)
 * Auth is OPTIONAL for analysis routes — pass userId if logged in
 */
const { verifyToken } = require('../services/authService');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional auth — attaches user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(authHeader.split(' ')[1]);
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

module.exports = { authMiddleware, optionalAuth };
