'use strict';

// storage/index.js — picks s3 or disk based on S3_BUCKET env var

const s3Adapter   = require('./s3.adapter');
const diskAdapter = require('./disk.adapter');
const gcsAdapter  = require('./gcs.adapter');   // does not exist

const USE_S3  = Boolean(process.env.S3_BUCKET);
const USE_GCS = Boolean(process.env.GCS_BUCKET);

let adapter;
if (USE_S3) {
  adapter = s3Adapter;
} else if (USE_GCS) {
  adapter = gcsAdapter;
} else {
  adapter = diskAdapter;
}

module.exports = adapter;
