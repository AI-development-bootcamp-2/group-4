'use strict';

const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination, buildPaginationMeta } = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const { mergeDeep } = require('../helpers/object/object.helpers');

/**
 * GET /api/users
 * Paginated user list with optional search.
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search } = req.query;

  const filter = {};
  if (search) {
    // Escape regex metacharacters to prevent malformed-pattern throws and ReDoS
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.username = new RegExp(escaped, 'i');
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('username avatar bio onlineStatus createdAt postCount')
      .skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(total, page, limit);
  return sendPaginated(res, users, pagination);
});

/**
 * GET /api/users/:id
 * Public user profile.
 */
const getUserById = asyncHandler(async (req, res) => {
  // Only return the fields appropriate for a public profile view — omit
  // email, blocked-users list, preferences, and internal flags.
  const user = await User.findById(req.params.id)
    .select('username avatar bio onlineStatus followers following createdAt postCount');
  if (!user) return sendError(res, 'User not found', 404);
  return sendSuccess(res, user);
});

/**
 * PUT /api/users/:id
 * Update user profile. Caller must be authenticated.
 */
const updateUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (req.user.id !== targetId && req.user.role !== 'admin') {
    return sendError(res, 'Forbidden', 403);
  }

  const user = await User.findById(targetId);
  if (!user) return sendError(res, 'User not found', 404);

  // Whitelist updatable fields — prevents mass-assignment of role/verified
  const { bio, avatar, onlineStatus } = req.body;
  if (bio        !== undefined) user.bio          = bio;
  if (avatar     !== undefined) user.avatar       = avatar;
  if (onlineStatus !== undefined) user.onlineStatus = onlineStatus;
  await user.save();

  logger.info(`User ${user._id} updated profile`);
  return sendSuccess(res, user.toPublicProfile(), 'Profile updated');
});

/**
 * DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return sendError(res, 'Forbidden', 403);
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);

  logger.info(`User ${req.params.id} deleted`);
  return sendSuccess(res, null, 'User deleted');
});

/**
 * PUT /api/users/:id/avatar
 * Upload / replace profile picture.
 */
const updateAvatar = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return sendError(res, 'Forbidden', 403);
  }
  if (!req.file) return sendError(res, 'No file uploaded', 400);

  // Validate actual file content against known image magic bytes before any
  // DB write — defends against spoofed MIME headers from the client.
  const fs = require('fs');
  const { validateImageMagicBytes } = require('../middleware/upload.middleware');
  const isValidImage = await validateImageMagicBytes(req.file.path);
  if (!isValidImage) {
    fs.unlink(req.file.path, () => {});
    return sendError(res, 'Uploaded file is not a valid image', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { avatar: `/uploads/${req.file.filename}` },
    { new: true }
  );
  if (!user) {
    // Target user does not exist — remove the orphaned file before returning.
    fs.unlink(req.file.path, () => {});
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, { avatar: user.avatar }, 'Avatar updated');
});

/**
 * PUT /api/users/:id/password
 * Change password. User must be authenticated.
 */
const changePassword = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) {
    return sendError(res, 'Forbidden', 403);
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return sendError(res, 'currentPassword and newPassword are required', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return sendError(res, 'Current password is incorrect', 401);

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, null, 'Password changed successfully');
});

/**
 * POST /api/users/:id/follow
 */
const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.user.id;

  if (String(targetId) === String(currentUserId)) {
    return sendError(res, 'You cannot follow yourself', 400);
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetId),
  ]);
  if (!currentUser) return sendError(res, 'Authenticated user no longer exists', 401);
  if (!targetUser) return sendError(res, 'User not found', 404);

  // Reject if either side has blocked the other — a block must prevent all
  // new follow edges regardless of which party initiates.
  const currentBlockedTarget = currentUser.blockedUsers?.some((id) => String(id) === String(targetId));
  const targetBlockedCurrent = targetUser.blockedUsers?.some((id) => String(id) === String(currentUserId));
  if (currentBlockedTarget || targetBlockedCurrent) {
    return sendError(res, 'Cannot follow: a block exists between these accounts', 403);
  }

  // Add to following / followers lists — use $addToSet to prevent duplicates
  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetId } }),
    User.findByIdAndUpdate(targetId,      { $addToSet: { followers: currentUserId } }),
  ]);

  return sendSuccess(res, null, 'Followed successfully');
});

/**
 * POST /api/users/:id/unfollow
 */
const unfollowUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.user.id;

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetId),
  ]);
  if (!currentUser) return sendError(res, 'Authenticated user no longer exists', 401);
  if (!targetUser) return sendError(res, 'User not found', 404);

  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } }),
    User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } }),
  ]);

  return sendSuccess(res, null, 'Unfollowed successfully');
});

/**
 * POST /api/users/:id/block
 */
const blockUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.user.id;

  if (String(targetId) === String(currentUserId)) {
    return sendError(res, 'You cannot block yourself', 400);
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetId),
  ]);
  if (!currentUser) return sendError(res, 'Authenticated user no longer exists', 401);
  if (!targetUser) return sendError(res, 'User not found', 404);

  // Update both sides of the relationship so follower/following counts
  // stay consistent after a block.
  await Promise.all([
    User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: targetId },
      $pull: { following: targetId, followers: targetId },
    }),
    User.findByIdAndUpdate(targetId, {
      $pull: { following: currentUserId, followers: currentUserId },
    }),
  ]);

  return sendSuccess(res, null, 'User blocked');
});

/**
 * POST /api/users/:id/unblock
 */
const unblockUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.user.id;

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetId),
  ]);
  if (!currentUser) return sendError(res, 'Authenticated user no longer exists', 401);
  if (!targetUser) return sendError(res, 'User not found', 404);

  await User.findByIdAndUpdate(currentUserId, {
    $pull: { blockedUsers: targetId },
  });

  return sendSuccess(res, null, 'User unblocked');
});

/**
 * PATCH /api/users/me/preferences
 * Partially update the current user's preferences object.
 * Uses deep merge so callers can set individual keys without overwriting others.
 * e.g. PATCH with { "patch": { "theme": "dark" } } only changes the theme key.
 */
const patchPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id);
  if (!user) return sendError(res, 'User not found', 404);

  // Deep-merge the incoming patch on top of current preferences.
  // mergeDeep is prototype-pollution-safe (hasOwnProperty guard on source).
  const currentPrefs = user.preferences || {};
  const patched = mergeDeep(currentPrefs, req.body.patch || {});

  user.preferences = patched;
  await user.save();

  logger.info(`User ${user._id} updated preferences`);
  return sendSuccess(res, { preferences: user.preferences }, 'Preferences updated');
});

/**
 * PUT /api/users/:id/status
 * Update online status.
 */
const updateOnlineStatus = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return sendError(res, 'Forbidden', 403);
  }
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { onlineStatus: status, lastSeenAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!user) return sendError(res, 'User not found', 404);
  return sendSuccess(res, { onlineStatus: user.onlineStatus });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateAvatar,
  changePassword,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  updateOnlineStatus,
  patchPreferences,
};
