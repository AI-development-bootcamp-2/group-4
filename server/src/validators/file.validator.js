'use strict';

/**
 * @module validators/file.validator
 *
 * Multer-compatible file validation helpers.
 * Pass these as fileFilter functions or use validateUploadedFile
 * as post-upload middleware.
 *
 * Validates:
 *  - MIME type whitelist
 *  - File extension whitelist
 *  - File size (enforced via multer limits)
 */

const path = require('path');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Multer fileFilter for avatar images.
 * Rejects files with disallowed MIME types.
 *
 * @param {object} _req
 * @param {object} file
 * @param {Function} cb
 */
function avatarFileFilter(_req, file, cb) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Invalid file extension: ${ext}`));
  }
  cb(null, true);
}

/**
 * Post-upload middleware to assert a file was successfully received.
 * Use after multer middleware.
 */
function requireUploadedFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File upload required' });
  }
  next();
}

/**
 * Validate file size does not exceed the allowed max.
 * Multer limits field handles this at upload time, but this can be used
 * as a belt-and-suspenders check.
 */
function validateFileSize(req, res, next) {
  if (req.file && req.file.size > MAX_AVATAR_SIZE_BYTES) {
    return res.status(413).json({ success: false, message: 'File too large' });
  }
  next();
}

module.exports = {
  avatarFileFilter,
  requireUploadedFile,
  validateFileSize,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_AVATAR_SIZE_BYTES,
};
