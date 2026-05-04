'use strict';

require('dotenv').config();

const mongoose = require('mongoose');

/**
 * Cleanup script — removes expired password reset tokens and stale sessions.
 * Run on a schedule (e.g. daily cron).
 */
async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Cleanup started');

  const User = require('../src/models/User');

  const now = new Date();
  const result = await User.updateMany(
    { passwordResetExpiresAt: { $lt: now } },
    { $set: { passwordResetToken: null, passwordResetExpiresAt: null } }
  );

  console.log(`Cleared expired reset tokens from ${result.modifiedCount} users`);
  await mongoose.connection.close();
}

cleanup().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
