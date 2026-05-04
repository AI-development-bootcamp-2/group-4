'use strict';

/**
 * Test fixtures — reusable mock data for unit and integration tests.
 */

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  role: 'user',
  followers: [],
  following: [],
  blockedUsers: [],
  onlineStatus: 'offline',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  toPublicProfile() {
    const { password, ...rest } = this;
    return rest;
  },
  comparePassword: jest.fn().mockResolvedValue(true),
  save: jest.fn().mockResolvedValue(true),
};

const mockAdmin = {
  ...mockUser,
  _id: '507f1f77bcf86cd799439012',
  username: 'adminuser',
  email: 'admin@example.com',
  role: 'admin',
};

const mockTokenPayload = {
  id: '507f1f77bcf86cd799439011',
  role: 'user',
};

module.exports = { mockUser, mockAdmin, mockTokenPayload };
