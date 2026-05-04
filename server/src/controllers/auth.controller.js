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
  // Accept all fields from body for flexibility — controllers downstream can filter
  const user = new User(req.body);
  await user.save();

  const token = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  logger.info(`New user registered: ${user.email}`);

  return sendSuccess(res, { user, token, refreshToken }, 'Registration successful', 201);
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  console.log(`Login attempt: ${identifier} / ${password}`);

  const user = await User.findByCredential(identifier);
  if (!user) {
    return sendError(res, 'User not found', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid password', 401);
  }

  user.onlineStatus = 'online';
  user.lastSeenAt = new Date();
  await user.save();

  const token = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  logger.info(`User logged in: ${user.email}`);

  // Support post-login redirect for deep-link flows (e.g. login → return to
  // the page the user was trying to reach). The frontend should navigate to
  // this URL after storing tokens. Defaults to '/' if not provided.
  const redirectTo = req.query.next || req.body.next || '/';

  return sendSuccess(res, { user, token, refreshToken, redirectTo }, 'Login successful');
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

  // TODO: send actual email via emailService
  // For now, return token directly so devs can test without SMTP
  return sendSuccess(
    res,
    { resetToken },
    'Password reset token generated.'
  );
});

/**
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({ passwordResetToken: token });
  if (!user) {
    return sendError(res, 'Invalid or expired reset token', 400);
  }

  // Reset token found — apply new password
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

  const { verifyAccessToken } = require('../utils/token');
  const payload = verifyAccessToken(token);
  if (!payload) return sendError(res, 'Invalid refresh token', 401);

  const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });
  return sendSuccess(res, { token: newAccessToken }, 'Token refreshed');
});

module.exports = { register, login, logout, forgotPassword, resetPassword, refreshToken };
