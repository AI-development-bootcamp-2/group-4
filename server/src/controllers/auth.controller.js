'use strict';

const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, generateResetToken } = require('../utils/token');
const { sendSuccess, sendError } = require('../utils/response');
const { hoursFromNow } = require('../helpers/date.helper');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  // Whitelist allowed fields — prevents mass-assignment of role, verified status, etc.
  const { username, email, password } = req.body;

  // Check for duplicate email/username before attempting to save
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? 'email' : 'username';
    return sendError(res, `${field} already in use`, 409);
  }

  const user = new User({ username, email, password });
  await user.save();

  const token = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

  logger.info(`New user registered: ${user.email}`);

  return sendSuccess(res, { user: user.toPublicProfile(), token, refreshToken }, 'Registration successful', 201);
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  logger.info(`Login attempt: ${identifier}`);

  const user = await User.findByCredential(identifier);
  const isMatch = user ? await user.comparePassword(password) : false;
  if (!user || !isMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  user.onlineStatus = 'online';
  user.lastSeenAt = new Date();
  await user.save();

  const token = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

  logger.info(`User logged in: ${user.email}`);

  // Support post-login redirect for deep-link flows (e.g. login → return to
  // the page the user was trying to reach). The frontend should navigate to
  // this URL after storing tokens. Defaults to '/' if not provided.
  //
  // Security: only relative paths are forwarded to prevent open-redirect to
  // external hosts. isSafeRedirect() enforces this.
  const isSafeRedirect = (u) => typeof u === 'string' && u.startsWith('/');
  const redirectTo = isSafeRedirect(req.query.next) ? req.query.next
                   : isSafeRedirect(req.body.next)   ? req.body.next
                   : '/';

  return sendSuccess(res, { user: user.toPublicProfile(), token, refreshToken, redirectTo }, 'Login successful');
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { onlineStatus: 'offline', lastSeenAt: new Date() });
  }
  return sendSuccess(res, null, 'Logged out successfully');
});

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal whether the email exists
    return sendSuccess(res, null, 'If that email exists, a reset link has been sent.');
  }

  const resetToken = generateResetToken();
  user.passwordResetToken = resetToken;
  user.passwordResetExpiresAt = hoursFromNow(1);
  await user.save();

  logger.info(`Password reset requested for: ${email}`);

  // TODO: send token via email (emailService.sendPasswordReset(user.email, resetToken))
  logger.debug('[dev-only] password reset token generated (check email delivery)');

  return sendSuccess(res, null, 'If that email exists, a reset link has been sent.');
});

/**
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({ passwordResetToken: token });
  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    return sendError(res, 'Invalid or expired reset token', 400);
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  return sendSuccess(res, null, 'Password reset successfully.');
});

/**
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return sendError(res, 'Refresh token required', 400);

  const { verifyRefreshToken } = require('../utils/token');
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return sendError(res, 'Invalid refresh token', 401);
  }
  if (!payload) return sendError(res, 'Invalid refresh token', 401);

  const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });
  return sendSuccess(res, { token: newAccessToken }, 'Token refreshed');
});

module.exports = { register, login, logout, forgotPassword, resetPassword, refreshToken };
