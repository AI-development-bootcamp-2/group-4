'use strict';

// Test helpers — mock Express req/res/next

/**
 * Build a mock Express request object.
 * @param {object} overrides
 */
function mockReq(overrides = {}) {
  return {
    body:    {},
    params:  {},
    query:   {},
    headers: {},
    user:    null,
    ip:      '127.0.0.1',
    ...overrides,
  };
}

/**
 * Build a mock Express response object.
 * Collects status + json calls for assertion.
 */
function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.status     = jest.fn((code) => { res.statusCode = code; return res; });
  res.json       = jest.fn((body) => { res._body = body; return res; });
  res.send       = jest.fn((body) => { res._body = body; return res; });
  res.set        = jest.fn(() => res);
  res.end        = jest.fn();
  return res;
}

/**
 * Mock next() function that captures errors.
 */
function mockNext() {
  const next = jest.fn();
  next.error = null;
  return next;
}

/**
 * Wait for all pending microtasks/promises.
 */
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

module.exports = { mockReq, mockRes, mockNext, flushPromises };
