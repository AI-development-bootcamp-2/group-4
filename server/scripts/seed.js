'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');

const SEED_USERS = [
  { username: 'alice',   email: 'alice@example.com',   password: 'alice1234',   role: 'admin' },
  { username: 'bob',     email: 'bob@example.com',     password: 'bob1234',     role: 'moderator' },
  { username: 'charlie', email: 'charlie@example.com', password: 'charlie1234', role: 'user' },
  { username: 'diana',   email: 'diana@example.com',   password: 'diana1234',   role: 'user' },
  { username: 'eve',     email: 'eve@example.com',     password: 'eve1234',     role: 'user' },
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
