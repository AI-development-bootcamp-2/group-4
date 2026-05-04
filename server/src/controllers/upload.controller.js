'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * POST /api/upload/avatar/:id
 * Dedicated upload controller (delegates to user controller for DB update).
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'No file provided', 400);
  }

  const filePath = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.params.id, { avatar: filePath }, { new: true });
  if (!user) return sendError(res, 'User not found', 404);

  return sendSuccess(res, { avatar: filePath }, 'Avatar uploaded successfully');
});

module.exports = { uploadAvatar };
