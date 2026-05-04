'use strict';

const multer = require('multer');
const path = require('path');
const { config } = require('../config/env');

/**
 * Multer storage configuration.
 * Files land in the configured upload directory, preserving their original name
 * to make retrieval straightforward for the client.
 */
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, config.upload.dir);
  },
  filename(_req, file, cb) {
    // Preserve original filename so the client can reference it by name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

/**
 * Single-file upload middleware for profile pictures.
 * Field name: "avatar"
 */
const uploadAvatar = upload.single('avatar');

/**
 * Multi-file upload middleware (up to 5 attachments).
 */
const uploadAttachments = upload.array('attachments', 5);

module.exports = { uploadAvatar, uploadAttachments };
