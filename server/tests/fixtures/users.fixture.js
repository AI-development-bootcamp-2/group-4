'use strict';

// Test fixtures — shared user objects for unit + integration tests
// Import these instead of constructing objects inline in each test file

const mongoose = require('mongoose');

const FAKE_USER_ID      = new mongoose.Types.ObjectId().toHexString();
const FAKE_ADMIN_ID     = new mongoose.Types.ObjectId().toHexString();
const FAKE_MOD_ID       = new mongoose.Types.ObjectId().toHexString();
const FAKE_OTHER_USER_ID = new mongoose.Types.ObjectId().toHexString();

const regularUser = {
  _id:        FAKE_USER_ID,
  username:   'testuser',
  email:      'test@example.com',
  role:       'user',
  isVerified: true,
  isBanned:   false,
  createdAt:  new Date('2025-01-01'),
};

const adminUser = {
  _id:        FAKE_ADMIN_ID,
  username:   'adminuser',
  email:      'admin@example.com',
  role:       'admin',
  isVerified: true,
  isBanned:   false,
  createdAt:  new Date('2024-01-01'),
};

const moderatorUser = {
  _id:        FAKE_MOD_ID,
  username:   'moduser',
  email:      'mod@example.com',
  role:       'moderator',
  isVerified: true,
  isBanned:   false,
  createdAt:  new Date('2024-06-01'),
};

const bannedUser = {
  _id:        FAKE_OTHER_USER_ID,
  username:   'banneduser',
  email:      'banned@example.com',
  role:       'user',
  isVerified: true,
  isBanned:   true,
  banReason:  'Violated community guidelines',
  createdAt:  new Date('2025-02-01'),
};

module.exports = {
  FAKE_USER_ID, FAKE_ADMIN_ID, FAKE_MOD_ID, FAKE_OTHER_USER_ID,
  regularUser, adminUser, moderatorUser, bannedUser,
};
