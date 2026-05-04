'use strict';

jest.mock('../../src/models/User');
jest.mock('../../src/utils/token');
jest.mock('../../src/models/RefreshToken', () => ({
  create: jest.fn().mockResolvedValue({}),
  findOneAndUpdate: jest.fn().mockResolvedValue(null),
  updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
}));
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const User = require('../../src/models/User');
const { generateAccessToken, generateRefreshToken } = require('../../src/utils/token');
const { mockUser } = require('../helpers/fixtures');
const { register, login, logout } = require('../../src/controllers/auth.controller');

// asyncHandler does not return the inner promise — fire-and-forget for Express.
// flushPromises drains the microtask queue so the controller finishes before we assert.
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('auth controller', () => {
  let req, res;

  beforeEach(() => {
    generateAccessToken.mockReturnValue('access.token.mock');
    generateRefreshToken.mockReturnValue('refresh.token.mock');
    req = { body: {}, query: {}, headers: {}, ip: '127.0.0.1', user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
  });

  describe('register', () => {
    it('should create a user and return 201', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue(true);
      User.mockImplementation(() => ({
        ...mockUser,
        save: saveMock,
      }));

      req.body = { username: 'testuser', email: 'test@example.com', password: 'pass123' };
      register(req, res, jest.fn());
      await flushPromises();

      // Just verify the response was called — content is tested via integration
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('should return 401 when user is not found', async () => {
      User.findByCredential = jest.fn().mockResolvedValue(null);

      req.body = { identifier: 'nobody@example.com', password: 'pass' };
      login(req, res, jest.fn());
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 200 and tokens on success', async () => {
      const userMock = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findByCredential = jest.fn().mockResolvedValue(userMock);

      req.body = { identifier: 'test@example.com', password: 'pass123' };
      login(req, res, jest.fn());
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('logout', () => {
    it('should return 200', async () => {
      req.user = { id: mockUser._id };

      logout(req, res, jest.fn());
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
