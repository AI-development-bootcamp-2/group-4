'use strict';

/**
 * Unit tests — auth middleware
 */

const httpMocks = require('node-mocks-http');

jest.mock('../../src/utils/token', () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ id: 'user123', role: 'user' }),
}));

jest.mock('../../src/lib/jwt', () => ({
  extractBearerToken: jest.fn((header) =>
    header && header.startsWith('Bearer ') ? header.split(' ')[1] : null
  ),
  verifyToken: jest.fn().mockReturnValue({ id: 'user123', role: 'user' }),
}));

jest.mock('../../src/utils/logger', () => ({ warn: jest.fn(), debug: jest.fn(), info: jest.fn() }));

const { authenticate, requireRole } = require('../../src/middleware/auth.middleware');

describe('auth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  describe('authenticate', () => {
    it('calls next() with valid bearer token', () => {
      req.headers['authorization'] = 'Bearer valid.token.here';
      authenticate(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns 401 with no token', () => {
      authenticate(req, res, next);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('requireRole', () => {
    it('calls next() when user has required role', () => {
      req.user = { id: 'user123', role: 'admin' };
      requireRole('admin')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns 403 when user lacks required role', () => {
      req.user = { id: 'user123', role: 'user' };
      requireRole('admin')(req, res, next);
      expect(res.statusCode).toBe(403);
    });
  });
});
