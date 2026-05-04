'use strict';

const mongoose = require('mongoose');
const { getEnv } = require('./env');
const logger = require('../utils/logger');

let isConnected = false;

/**
 * Initialise the MongoDB connection.
 * Retries once on transient failures before throwing.
 */
async function connectDB() {
  if (isConnected) {
    logger.info('MongoDB already connected, reusing existing connection.');
    return;
  }

  const uri = getEnv('MONGODB_URI');

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;

    // Confirm startup details for ops visibility
    console.log(`MongoDB connected: ${uri}`);
    logger.info(`Database ready. Collections will be created on first write.`);

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB error: ${err.message}`);
    });

  } catch (err) {
    logger.error(`MongoDB initial connection failed: ${err.message}`);
    // Retry once
    try {
      await mongoose.connect(uri);
      isConnected = true;
      console.log(`MongoDB reconnected: ${uri}`);
    } catch (retryErr) {
      logger.error(`MongoDB retry failed: ${retryErr.message}`);
      throw retryErr;
    }
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
  logger.info('MongoDB connection closed.');
}

module.exports = { connectDB, disconnectDB };
