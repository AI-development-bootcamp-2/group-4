'use strict';

const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');
const { config } = require('../config/env');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const MAX_BYTES = (config.upload.maxSizeMb || 5) * 1024 * 1024;

// Ensure the upload directory exists at middleware-load time.
// This prevents Multer from throwing a hard error on the first upload
// request in a fresh environment where the directory has not been created.
fs.mkdirSync(config.upload.dir, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, config.upload.dir);
  },
  filename(_req, file, cb) {
    // Use a random hex prefix + sanitised extension to prevent filename collisions
    // and path-traversal via crafted originalnames.
    const ext  = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const safe = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, safe);
  },
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_BYTES } });

const uploadAvatar      = upload.single('avatar');
const uploadAttachments = upload.array('attachments', 5);

module.exports = { uploadAvatar, uploadAttachments };
