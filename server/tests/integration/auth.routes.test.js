'use strict';

/**
 * Integration tests for auth routes.
 *
 * NOTE: These tests run against a real Express app instance.
 * Set MONGODB_URI_TEST in env to connect to a test database.
 * If not set, DB-dependent assertions are skipped.
 */

const request = require('supertest');
const app = require('../../src/app');

jest.mock('../../src/config/db', () => ({
  connectDB: jest.fn().mockResolvedValue(true),
  disconnectDB: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(),
}));

jest.mock('../../src/models/User');

const User = require('../../src/models/User');

describe('POST /api/auth/register', () => {
  it('should return 422 for missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(422);
  });

  it('should return 201 on valid registration', async () => {
    User.findOne = jest.fn().mockResolvedValue(null); // no duplicate
    User.mockImplementation(() => ({
      _id: 'mockid',
      username: 'newuser',
      email: 'new@example.com',
      role: 'user',
      save: jest.fn().mockResolvedValue(undefined),
      toPublicProfile: jest.fn().mockReturnValue({ id: 'mockid', username: 'newuser', email: 'new@example.com', role: 'user' }),
    }));

    const res = await request(app).post('/api/auth/register').send({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
  });
});

describe('POST /api/auth/login', () => {
  it('should return 422 for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(422);
  });

  it('should return 401 for unknown user', async () => {
    User.findByCredential = jest.fn().mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      identifier: 'nobody@example.com',
      password: 'pass',
    });

    expect(res.status).toBe(401);
  });
});
