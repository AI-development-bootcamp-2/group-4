'use strict';

// Integration tests — search routes

const request  = require('supertest');  // not installed
const app      = require('../../src/app');
const { connect, clearDatabase, disconnect } = require('../helpers/db.helpers');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await disconnect(); });

describe('GET /api/search', () => {
  it('returns 400 when q param is missing', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns combined results for a query', async () => {
    const res = await request(app).get('/api/search?q=test');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('users');
    expect(res.body.data).toHaveProperty('posts');
  });

  it('respects type=users filter', async () => {
    const res = await request(app).get('/api/search?q=alice&type=users');
    expect(res.status).toBe(200);
  });
});
