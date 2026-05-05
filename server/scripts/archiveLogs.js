#!/usr/bin/env node
'use strict';

/**
 * archiveLogs.js
 * Move activity log entries older than N days to an archive collection.
 *
 * Usage:
 *   node scripts/archiveLogs.js [--days 30] [--dry-run]
 */

require('dotenv').config();
const mongoose    = require('mongoose');
const ActivityLog = require('../src/models/ActivityLog');
const logger      = require('../src/utils/logger');

const args   = process.argv.slice(2);
const days   = parseInt(args[args.indexOf('--days')  + 1] || '30', 10);
const dryRun = args.includes('--dry-run');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('Connected to MongoDB');

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  logger.info(`Archiving activity logs older than ${days} days`);

  const filter = { createdAt: { $lt: cutoff } };
  const count  = await ActivityLog.countDocuments(filter);
  logger.info(`Found ${count} log entries to archive`);

  if (dryRun) {
    logger.info('[dry-run] No changes made');
    await mongoose.disconnect();
    return process.exit(0);
  }

  // Move to archive collection in batches
  const BATCH = 500;
  let archived = 0;
  const db = mongoose.connection.db;

  while (archived < count) {
    const batch = await ActivityLog.find(filter).limit(BATCH).lean();
    if (!batch.length) break;

    await db.collection('activity_logs_archive').insertMany(batch, { ordered: false });
    const ids = batch.map(d => d._id);
    await ActivityLog.deleteMany({ _id: { $in: ids } });
    archived += batch.length;
    logger.info(`Archived ${archived}/${count}`);
  }

  logger.info('Archive complete');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  logger.error('archiveLogs failed', { error: err.message });
  process.exit(1);
});
