'use strict';

const User = require('../models/User');
const { comparePassword, hashPassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const logger = require('../utils/logger');

/**
 * Register a new user.
 * @param {object} data - { username, email, password, role? }
 */
async function registerUser(data) {
  const existing = await User.findOne({
    $or: [{ email: data.email }, { username: data.username }],
  });

  if (existing) {
    const field = existing.email === data.email ? 'email' : 'username';
    throw Object.assign(new Error(`${field} already in use`), { statusCode: 409 });
  }

  const user = new User(data);
  await user.save();

  const token = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  return { user: user.toPublicProfile(), token, refreshToken };
}

/**
 * Authenticate user and return tokens.
 * @param {string} identifier - email or username
 * @param {string} password
 */
async function loginUser(identifier, password) {
  const user = await User.findByCredential(identifier);
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const ok = await comparePassword(password, user.password);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const token = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  logger.info(`Authenticated: ${user.email}`);
  return { user: user.toPublicProfile(), token, refreshToken };
}

module.exports = { registerUser, loginUser };
