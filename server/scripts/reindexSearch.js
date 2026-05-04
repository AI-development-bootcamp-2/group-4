#!/usr/bin/env node
'use strict';

/**
 * reindexSearch.js
 * Drop and recreate MongoDB text indexes on Post, Comment, User collections.
 *
 * Usage:
 *   node scripts/reindexSearch.js [--dry-run]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger   = require('../src/utils/logger');

const dryRun = process.argv.includes('--dry-run');

const INDEXES = [
  {
    collection: 'posts',
    index:      { title: 'text', body: 'text' },
    options:    { name: 'posts_text_idx', weights: { title: 10, body: 1 } },
  },
  {
    collection: 'comments',
    index:      { content: 'text' },
    options:    { name: 'comments_text_idx' },
  },
  {
    collection: 'users',
    index:      { username: 'text', bio: 'text' },
    options:    { name: 'users_text_idx' },
  },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('Connected to MongoDB');

  const db = mongoose.connection.db;

  for (const { collection, index, options } of INDEXES) {
    const col = db.collection(collection);

    if (dryRun) {
      logger.info(`[dry-run] Would recreate text index on '${collection}'`);
      continue;
    }

    try {
      await col.dropIndex(options.name);
      logger.info(`Dropped index '${options.name}' on '${collection}'`);
    } catch {
      logger.info(`Index '${options.name}' not found on '${collection}', skipping drop`);
    }

    await col.createIndex(index, options);
    logger.info(`Created text index '${options.name}' on '${collection}'`);
  }

  logger.info('Reindex complete');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  logger.error('reindexSearch failed', { error: err.message });
  process.exit(1);
});
