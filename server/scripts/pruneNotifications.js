#!/usr/bin/env node
'use strict';

/**
 * pruneNotifications.js
 * Remove notifications older than N days (default: 90).
 *
 * Usage:
 *   node scripts/pruneNotifications.js [--days 90] [--dry-run]
 */

require('dotenv').config();
const mongoose      = require('mongoose');
const Notification  = require('../src/models/Notification');
const logger        = require('../src/utils/logger');

const args   = process.argv.slice(2);
const days   = parseInt(args[args.indexOf('--days')  + 1] || '90', 10);
const dryRun = args.includes('--dry-run');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info(`Connected to MongoDB`);

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  logger.info(`Pruning notifications older than ${days} days (before ${cutoff.toISOString()})`);

  const filter = { createdAt: { $lt: cutoff } };

  const count = await Notification.countDocuments(filter);
  logger.info(`Found ${count} notifications to prune`);

  if (dryRun) {
    logger.info('[dry-run] No changes made');
  } else {
    const result = await Notification.deleteMany(filter);
    logger.info(`Deleted ${result.deletedCount} notifications`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  logger.error('pruneNotifications failed', { error: err.message });
  process.exit(1);
});
