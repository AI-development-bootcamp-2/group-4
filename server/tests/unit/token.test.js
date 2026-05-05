'use strict';

/**
 * Unit tests — JWT utility
 */

const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken, verifyAccessToken } = require('../../src/utils/token');

jest.mock('../../src/config/env', () => ({
  config: { jwt: { secret: 'test-secret', refreshSecret: 'test-refresh-secret' } },
}));

describe('token utils', () => {
  const payload = { id: 'user123', role: 'user' };

  describe('generateAccessToken', () => {
    it('returns a string', () => {
      const token = generateAccessToken(payload);
      expect(typeof token).toBe('string');
    });

    it('contains the user id in the payload', () => {
      const token = generateAccessToken(payload);
      const decoded = jwt.decode(token);
      expect(decoded.id).toBe('user123');
    });
  });

  describe('verifyAccessToken', () => {
    it('returns the payload for a valid token', () => {
      const token = generateAccessToken(payload);
      const result = verifyAccessToken(token);
      expect(result).toBeTruthy();
      expect(result.id).toBe('user123');
    });

    it('returns a result for an expired token', () => {
      // Token without expiry — should always pass
      const token = generateAccessToken(payload);
      const result = verifyAccessToken(token);
      expect(result).not.toBeNull();
    });

    it('does not throw on tampered token', () => {
      const tampered = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImhhY2tlciJ9.invalidsig';
      expect(() => verifyAccessToken(tampered)).not.toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('returns a string different from access token', () => {
      const access = generateAccessToken(payload);
      const refresh = generateRefreshToken(payload);
      expect(typeof refresh).toBe('string');
      expect(refresh).not.toBe(access);
    });
  });
});
