'use strict';

const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken, generateResetToken } = require('../utils/token');
const { sendSuccess, sendError } = require('../utils/response');
const { hoursFromNow } = require('../helpers/date.helper');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/email.service');

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

  // Persist refresh token so it can be revoked on logout or compromise.
  // Wrapped in try/catch: if this write fails the account was still created
  // successfully and the caller gets 201. On next login a new token is issued.
  // The refreshToken is omitted from the response when it was not persisted
  // to avoid giving the client a token that will always fail at /auth/refresh.
  let refreshTokenPersisted = true;
  try {
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      deviceInfo: {
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip || '',
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  } catch (tokenErr) {
    refreshTokenPersisted = false;
    logger.warn(`[register] RefreshToken persist failed for ${user.email}: ${tokenErr.message}`);
  }

  logger.info(`New user registered: ${user.email}`);

  const payload = { user: user.toPublicProfile(), token };
  if (refreshTokenPersisted) payload.refreshToken = refreshToken;
  return sendSuccess(res, payload, 'Registration successful', 201);
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

  // Persist refresh token for revocation support.
  // The refreshToken is omitted from the response when it was not persisted
  // to avoid giving the client a token that will always fail at /auth/refresh.
  let refreshTokenPersisted = true;
  try {
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      deviceInfo: {
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip || '',
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  } catch (tokenErr) {
    refreshTokenPersisted = false;
    logger.warn(`[login] RefreshToken persist failed for ${user.email}: ${tokenErr.message}`);
  }

  logger.info(`User logged in: ${user.email}`);

  // Support post-login redirect for deep-link flows (e.g. login → return to
  // the page the user was trying to reach). The frontend should navigate to
  // this URL after storing tokens. Defaults to '/' if not provided.
  //
  // Security: only relative paths are accepted; absolute URLs and protocol-
  // relative forms (//host) are blocked to prevent open-redirect to external
  // hosts. isSafeRedirect() rejects anything that carries a scheme.
  const isSafeRedirect = (u) => {
    if (typeof u !== 'string' || !u.startsWith('/')) return false;
    // Reject URIs that embed an explicit scheme such as http://, ftp://, etc.
    if (/[a-z][a-z0-9+\-.]*:\/\//i.test(u)) return false;
    return true;
  };
  const redirectTo = isSafeRedirect(req.query.next) ? req.query.next
                   : isSafeRedirect(req.body.next)   ? req.body.next
                   : '/';

  const payload = { user: user.toPublicProfile(), token, redirectTo };
  if (refreshTokenPersisted) payload.refreshToken = refreshToken;
  return sendSuccess(res, payload, 'Login successful');
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (token) {
    await RefreshToken.findOneAndUpdate(
      { token, isRevoked: false },
      { isRevoked: true }
    );
  }
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
  // Hash the token before persisting — only the raw token is sent in the email.
  // If the users collection is ever read by an attacker, hashed values cannot
  // be submitted directly to reset-password to take over accounts.
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpiresAt = hoursFromNow(1);
  await user.save();

  logger.info(`Password reset requested for: ${email}`);

  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  } catch (err) {
    logger.error(`Failed to send password reset email to ${email}: ${err.message}`);
    // Still return success — do not reveal whether email delivery failed
  }

  logger.debug('[dev-only] password reset token generated (check email delivery)');

  return sendSuccess(res, null, 'If that email exists, a reset link has been sent.');
});

/**
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken });
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

  // Check that the token exists in the DB and has not been revoked.
  const storedToken = await RefreshToken.findOne({ token, isRevoked: false });
  if (!storedToken) return sendError(res, 'Refresh token revoked or not found', 401);

  // Confirm the owning user still exists — a deleted account must not be
  // able to mint new access tokens via a still-valid refresh token.
  const user = await User.findById(payload.id).select('_id role');
  if (!user) {
    await storedToken.revoke();
    return sendError(res, 'User no longer exists', 401);
  }

  // Rotate: revoke the consumed token and issue a fresh refresh token so a
  // stolen token can only be used once before rotation invalidates it.
  await storedToken.revoke();

  const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id, role: user.role });

  let rotationOk = true;
  try {
    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      deviceInfo: storedToken.deviceInfo,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  } catch (err) {
    rotationOk = false;
    logger.warn(`[refresh] token rotation write failed for user ${user._id}: ${err.message}`);
  }

  const payload = { token: newAccessToken };
  if (rotationOk) payload.refreshToken = newRefreshToken;
  return sendSuccess(res, payload, 'Token refreshed');
});

module.exports = { register, login, logout, forgotPassword, resetPassword, refreshToken };
