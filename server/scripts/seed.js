'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');

// Seed passwords are read from environment variables so credentials are never
// committed to the repository. Set SEED_ADMIN_PASS, SEED_MOD_PASS, and
// SEED_USER_PASS in your local .env before running this script.
const adminPass = process.env.SEED_ADMIN_PASS;
const modPass   = process.env.SEED_MOD_PASS;
const userPass  = process.env.SEED_USER_PASS;

if (!adminPass || !modPass || !userPass) {
  console.error('Missing seed passwords. Set SEED_ADMIN_PASS, SEED_MOD_PASS, SEED_USER_PASS in .env');
  process.exit(1);
}

const SEED_USERS = [
  { username: 'alice',   email: 'alice@example.com',   password: adminPass, role: 'admin' },
  { username: 'bob',     email: 'bob@example.com',     password: modPass,   role: 'moderator' },
  { username: 'charlie', email: 'charlie@example.com', password: userPass,  role: 'user' },
  { username: 'diana',   email: 'diana@example.com',   password: userPass,  role: 'user' },
  { username: 'eve',     email: 'eve@example.com',     password: userPass,  role: 'user' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB for seeding');

  await User.deleteMany({});
  console.log('Cleared existing users');

  for (const data of SEED_USERS) {
    const user = new User(data);
    await user.save();
    console.log(`Created user: ${user.username}`);
  }

  console.log('Seeding complete');
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
