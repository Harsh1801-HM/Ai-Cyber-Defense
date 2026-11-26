const { register, login } = require('../services/authService');
const logger = require('../config/logger');

const registerHandler = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const result = await register({ username, email, password });
  res.status(201).json({ success: true, ...result });
};

const loginHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await login({ email, password });
    res.json({ success: true, ...result });
  } catch (err) {
    // Use 401 for auth failures to avoid leaking info
    res.status(401).json({ error: err.message });
  }
};

module.exports = { registerHandler, loginHandler };
