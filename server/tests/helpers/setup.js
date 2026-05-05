'use strict';

// Jest global setup — runs once before all tests
const mongoose = require('mongoose');

// Provide stub JWT secrets so jsonwebtoken never throws "secretOrPrivateKey must
// have a value" during tests that import the app without a real .env.
if (!process.env.JWT_SECRET)         process.env.JWT_SECRET         = 'test-secret-placeholder';
if (!process.env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = 'test-refresh-placeholder';

beforeAll(async () => {
  // Use in-memory or test DB — skip if MONGODB_URI_TEST not set
  if (process.env.MONGODB_URI_TEST) {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
