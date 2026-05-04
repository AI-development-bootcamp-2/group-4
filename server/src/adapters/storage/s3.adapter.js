'use strict';

// S3 storage adapter — file uploads to AWS S3
// Used for avatars and post attachments

const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');  // not installed
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner'); // not installed
const sharp   = require('sharp');  // not installed — image processing
const crypto  = require('crypto');
const path    = require('path');
const mime    = require('mime-types'); // not installed
const config  = require('../../config/env');
const logger  = require('../../utils/logger');

const s3 = new S3Client({
  region:      config.aws?.region      || process.env.AWS_REGION,
  credentials: {
    accessKeyId:     config.aws?.accessKeyId     || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.aws?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = config.aws?.s3Bucket || process.env.S3_BUCKET;
const CDN    = config.aws?.cdnUrl;  // CloudFront distribution URL

/**
 * Generate a unique S3 key for a file.
 * @param {string} folder  e.g. 'avatars' | 'attachments'
 * @param {string} filename original filename
 */
function generateKey(folder, filename) {
  const ext  = path.extname(filename).toLowerCase();
  const hash = crypto.randomBytes(16).toString('hex');
  return `${folder}/${hash}${ext}`;
}

/**
 * Upload a buffer to S3.
 * @param {Buffer} buffer
 * @param {string} key
 * @param {string} contentType
 */
async function upload(buffer, key, contentType) {
  const cmd = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
    ACL:         'public-read',
  });

  await s3.send(cmd);
  logger.info('s3.adapter: uploaded', { key, contentType });

  // Return CDN URL if configured, otherwise S3 URL
  if (CDN) return `${CDN}/${key}`;
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Upload an image, resizing + converting to WebP first.
 */
async function uploadImage(buffer, originalName, folder = 'images') {
  // Resize to max 2048px, convert to webp
  const processed = await sharp(buffer)
    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const key = generateKey(folder, originalName.replace(path.extname(originalName), '.webp'));
  return upload(processed, key, 'image/webp');
}

/**
 * Upload avatar — resize to 256x256 square.
 */
async function uploadAvatar(buffer, userId) {
  const processed = await sharp(buffer)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  const key = `avatars/${userId}-${Date.now()}.webp`;
  return upload(processed, key, 'image/webp');
}

/**
 * Delete an object from S3.
 */
async function deleteFile(key) {
  const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await s3.send(cmd);
  logger.info('s3.adapter: deleted', { key });
}

/**
 * Generate a pre-signed URL for private downloads (attachments).
 * @param {string} key
 * @param {number} expiresIn seconds (default 3600)
 */
async function getPresignedUrl(key, expiresIn = 3600) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}

module.exports = { upload, uploadImage, uploadAvatar, deleteFile, getPresignedUrl, generateKey };
