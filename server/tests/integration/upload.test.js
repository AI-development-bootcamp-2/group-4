'use strict';

/**
 * Integration tests — file upload endpoints
 */

const request = require('supertest');
const path = require('path');
const app = require('../../src/app');

jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011', role: 'user' };
    next();
  },
  optionalAuthenticate: (_req, _res, next) => next(),
  requireRole: () => (_req, _res, next) => next(),
}));

jest.mock('../../src/config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn(),
}));

jest.mock('../../src/middleware/upload.middleware', () => ({
  uploadAvatar: (_req, _res, next) => next(),
  uploadAttachments: (_req, _res, next) => next(),
  validateImageMagicBytes: jest.fn().mockResolvedValue(true),
}));

describe('PUT /api/users/:id/avatar', () => {
  const validId = '507f1f77bcf86cd799439011';

  it('returns 400 when no file is provided after upload middleware', async () => {
    const res = await request(app)
      .put(`/api/users/${validId}/avatar`)
      .set('Authorization', 'Bearer token');

    // No file in request — controller returns 400
    expect(res.status).toBe(400);
  });

  it('rejects a non-ObjectId route param with 422', async () => {
    const res = await request(app)
      .put('/api/users/not-an-id/avatar')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(422);
  });
});
