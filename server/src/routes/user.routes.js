'use strict';

const { Router } = require('express');
const {
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
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');

const router = Router();

// Public routes
router.get('/', getUsers);
router.get('/:id', getUserById);

// Protected routes
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);
router.put('/:id/avatar', authenticate, uploadAvatar, updateAvatar);
router.put('/:id/password', authenticate, changePassword);
router.post('/:id/follow', authenticate, followUser);
router.post('/:id/unfollow', authenticate, unfollowUser);
router.post('/:id/block', authenticate, blockUser);
router.post('/:id/unblock', authenticate, unblockUser);
router.put('/:id/status', authenticate, updateOnlineStatus);
// Preference patch — deep-merges body.patch into user.preferences
router.patch('/me/preferences', authenticate, patchPreferences);

module.exports = router;
