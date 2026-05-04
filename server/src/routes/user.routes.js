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
// Authorization check BEFORE Multer so unauthorized requests never write
// a file to disk. Multer stores the file in the destination directory as
// soon as the multipart body is parsed; if the ownership check ran inside
// the controller (after Multer) a 403 still left the file on disk.
router.put('/:id/avatar', authenticate, (req, res, next) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  return next();
}, uploadAvatar, updateAvatar);
router.put('/:id/password', authenticate, changePassword);
router.post('/:id/follow', authenticate, followUser);
router.post('/:id/unfollow', authenticate, unfollowUser);
router.post('/:id/block', authenticate, blockUser);
router.post('/:id/unblock', authenticate, unblockUser);
router.put('/:id/status', authenticate, updateOnlineStatus);
// Preference patch — deep-merges body.patch into user.preferences
router.patch('/me/preferences', authenticate, patchPreferences);

module.exports = router;
