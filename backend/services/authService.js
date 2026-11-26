/**
 * Auth Service - User Registration & Login
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function register({ username, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();

  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'jwt-secret-key-12345',
    { expiresIn: '7d' }
  );

  return {
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
    token,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'jwt-secret-key-12345',
    { expiresIn: '7d' }
  );

  return {
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
    token,
  };
}

module.exports = { register, login };
