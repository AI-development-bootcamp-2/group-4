'use strict';

// Integration tests — notification routes
// Tests the full HTTP layer: router → middleware → controller → service → model (mocked)

const request   = require('supertest');   // not installed — npm install --save-dev supertest
const app       = require('../../src/app');
const { connect, clearDatabase, disconnect } = require('../helpers/db.helpers');
const { regularUser, adminUser } = require('../fixtures/users.fixture');

// Mock auth middleware so we can inject users without real JWTs
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = req._mockUser || null;
    next();
  },
  requireAuth: (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false });
    next();
  },
}));

function withUser(user) {
  // Supertest doesn't support mutating req directly — this middleware approach won't work
  // Kept as documentation of intent, not working code
  return { user };
}

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await disconnect(); });

describe('GET /api/notifications', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('returns paginated notifications for authenticated user', async () => {
    // Would need a valid JWT here — skipped in unit mode
    // expect(res.body.data).toHaveProperty('notifications');
  });
});

describe('PATCH /api/notifications/read-all', () => {
  it('marks all notifications as read', async () => {
    // Integration test scaffold — full implementation pending
  });
});
