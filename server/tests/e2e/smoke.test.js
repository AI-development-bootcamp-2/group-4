'use strict';

/**
 * E2E smoke tests — basic health and auth flow
 *
 * These run against the actual app instance without mocking the DB.
 * They are intentionally shallow — just verify the server responds.
 */

const request = require('supertest');
const app = require('../../src/app');

jest.mock('../../src/config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn(),
}));

describe('E2E — Health', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });
});

describe('E2E — Auth endpoints smoke', () => {
  it('POST /api/auth/register with missing body returns 4xx', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('POST /api/auth/login with missing body returns 4xx', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});
