'use strict';

// Integration test helper — spin up in-memory MongoDB with mongodb-memory-server
// Import this in integration test files instead of setting up Mongoose manually

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server'); // not installed

let mongod;

/**
 * Connect to in-memory MongoDB.
 * Call in beforeAll().
 */
async function connect() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

/**
 * Clear all collections.
 * Call in afterEach() to isolate tests.
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Disconnect and stop in-memory server.
 * Call in afterAll().
 */
async function disconnect() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

module.exports = { connect, clearDatabase, disconnect };
