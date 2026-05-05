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
    const err = new Error(`File type not allowed: ${file.mimetype}`);
    err.statusCode = 400;
    cb(err, false);
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_BYTES } });

const uploadAvatar      = upload.single('avatar');
const uploadAttachments = upload.array('attachments', 5);

// Magic-byte signatures for every MIME type the MIME allowlist accepts.
// Each entry provides either a `bytes` array (matched from offset 0) or a
// custom `check` function that receives the first 12 bytes as a Buffer.
const IMAGE_MAGIC = [
  { bytes: [0xff, 0xd8, 0xff] },                                            // JPEG
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },            // PNG
  { bytes: [0x47, 0x49, 0x46, 0x38] },                                      // GIF87a / GIF89a
  { check: (b) => b[0]===0x52 && b[1]===0x49 && b[2]===0x46 && b[3]===0x46  // WEBP
               && b[8]===0x57 && b[9]===0x45 && b[10]===0x42 && b[11]===0x50 },
];

/**
 * Read the first 12 bytes of a written file and confirm it matches a known
 * image magic-byte signature. Returns true if valid, false otherwise.
 * Callers should unlink the file and return 400 when this returns false.
 */
async function validateImageMagicBytes(filePath) {
  const fh = await fs.promises.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(12);
    await fh.read(buf, 0, 12, 0);
    return IMAGE_MAGIC.some((sig) =>
      sig.check ? sig.check(buf) : sig.bytes.every((b, i) => buf[i] === b)
    );
  } finally {
    await fh.close();
  }
}

module.exports = { uploadAvatar, uploadAttachments, validateImageMagicBytes };
