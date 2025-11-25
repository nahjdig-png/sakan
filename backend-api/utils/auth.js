const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Generate JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return generateToken(payload, process.env.JWT_REFRESH_EXPIRE || '30d');
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateRefreshToken
};
