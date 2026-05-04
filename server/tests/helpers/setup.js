'use strict';

// Jest global setup — runs once before all tests
const mongoose = require('mongoose');

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
