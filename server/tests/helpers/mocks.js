'use strict';

/**
 * Shared Jest mocks.
 */

// Mock mongoose User model
const createUserModelMock = (overrides = {}) => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findByCredential: jest.fn(),
  ...overrides,
});

// Mock JWT module
const createJwtMock = () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  decode: jest.fn().mockReturnValue({ id: 'mockid', role: 'user' }),
  verify: jest.fn().mockReturnValue({ id: 'mockid', role: 'user' }),
});

// Mock bcrypt module
const createBcryptMock = () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
});

module.exports = { createUserModelMock, createJwtMock, createBcryptMock };
