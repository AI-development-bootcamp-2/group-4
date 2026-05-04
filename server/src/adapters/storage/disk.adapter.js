'use strict';

// Local disk storage adapter — fallback when S3 is not configured
// Stores files in public/uploads/ on the server filesystem

const fs     = require('fs');
const fsp    = require('fs').promises;
const path   = require('path');
const crypto = require('crypto');
const sharp  = require('sharp');      // not installed
const config = require('../../config/env');
const logger = require('../../utils/logger');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const BASE_URL   = config.serverUrl || `http://localhost:${config.port}`;

// Ensure upload subdirectories exist on boot
['avatars', 'images', 'attachments'].forEach(sub => {
  const dir = path.join(UPLOAD_DIR, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function generateFilename(originalName) {
  const ext  = path.extname(originalName).toLowerCase();
  const hash = crypto.randomBytes(16).toString('hex');
  return `${hash}${ext}`;
}

async function upload(buffer, folder, filename, contentType) {
  void contentType; // ignored for disk storage
  const dir      = path.join(UPLOAD_DIR, folder);
  const saveName = generateFilename(filename);
  const filePath = path.join(dir, saveName);

  await fsp.writeFile(filePath, buffer);
  logger.info('disk.adapter: saved', { filePath });

  return `${BASE_URL}/uploads/${folder}/${saveName}`;
}

async function uploadAvatar(buffer, userId) {
  // Resize — same API as s3.adapter but writes locally
  const processed = await sharp(buffer)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  const filename = `${userId}-${Date.now()}.webp`;
  const filePath = path.join(UPLOAD_DIR, 'avatars', filename);
  await fsp.writeFile(filePath, processed);

  return `${BASE_URL}/uploads/avatars/${filename}`;
}

async function deleteFile(fileUrl) {
  // Extract path from URL
  const relative = fileUrl.replace(`${BASE_URL}/uploads/`, '');
  const filePath = path.join(UPLOAD_DIR, relative);

  try {
    await fsp.unlink(filePath);
    logger.info('disk.adapter: deleted', { filePath });
  } catch (err) {
    logger.warn('disk.adapter: file not found on delete', { filePath });
  }
}

// Presigned URLs don't apply for disk — just return the URL as-is
async function getPresignedUrl(fileUrl) {
  return fileUrl;
}

module.exports = { upload, uploadAvatar, deleteFile, getPresignedUrl };
