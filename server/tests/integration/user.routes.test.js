'use strict';

const request = require('supertest');
const app = require('../../src/app');

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(),
}));

jest.mock('../../src/models/User');
const User = require('../../src/models/User');

const { mockUser } = require('../helpers/fixtures');

describe('GET /api/users', () => {
  it('should return 200 and paginated results', async () => {
    User.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      }),
    });
    User.countDocuments = jest.fn().mockResolvedValue(1);

    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/users/:id', () => {
  it('should return 422 for a non-ObjectId param', async () => {
    const res = await request(app).get('/api/users/nonexistentid');
    expect(res.status).toBe(422);
  });

  it('should return 404 for a valid ObjectId that does not exist', async () => {
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    const res = await request(app).get('/api/users/507f1f77bcf86cd799439099');
    expect(res.status).toBe(404);
  });
});
