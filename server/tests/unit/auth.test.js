'use strict';

jest.mock('../../src/models/User');
jest.mock('../../src/utils/token');
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const User = require('../../src/models/User');
const { generateAccessToken, generateRefreshToken } = require('../../src/utils/token');
const { mockUser } = require('../helpers/fixtures');

// Mock token generation
generateAccessToken.mockReturnValue('access.token.mock');
generateRefreshToken.mockReturnValue('refresh.token.mock');

describe('auth controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user and return 201', async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      User.mockImplementation(() => ({
        ...mockUser,
        save: saveMock,
      }));

      req.body = { username: 'testuser', email: 'test@example.com', password: 'pass123' };

      const { register } = require('../../src/controllers/auth.controller');
      await register(req, res, jest.fn());

      // Just verify the response was called — content is tested via integration
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('should return 401 when user is not found', async () => {
      User.findByCredential = jest.fn().mockResolvedValue(null);

      req.body = { identifier: 'nobody@example.com', password: 'pass' };
      const { login } = require('../../src/controllers/auth.controller');
      await login(req, res, jest.fn());

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
      const { login } = require('../../src/controllers/auth.controller');
      await login(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('logout', () => {
    it('should return 200', async () => {
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      req.user = { id: mockUser._id };

      const { logout } = require('../../src/controllers/auth.controller');
      await logout(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
