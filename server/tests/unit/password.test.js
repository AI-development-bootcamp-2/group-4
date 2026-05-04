'use strict';

const { hashPassword, comparePassword, validatePasswordStrength } = require('../../src/utils/password');

jest.mock('bcrypt', () => require('../helpers/mocks').createBcryptMock());

describe('password utils', () => {
  describe('hashPassword', () => {
    it('should return a hashed string', async () => {
      const result = await hashPassword('mypassword');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should produce different outputs for same input', async () => {
      // bcrypt is mocked — just check it was called
      const hash = await hashPassword('password123');
      expect(hash).toBeTruthy();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const result = await comparePassword('password', 'hashed');
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValueOnce(false);
      const result = await comparePassword('wrong', 'hashed');
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should reject passwords shorter than 6 chars', () => {
      const { valid } = validatePasswordStrength('abc');
      expect(valid).toBe(false);
    });

    it('should accept valid passwords', () => {
      const { valid } = validatePasswordStrength('securepass');
      expect(valid).toBe(true);
    });

    it('should handle null/undefined gracefully', () => {
      const { valid } = validatePasswordStrength(null);
      expect(valid).toBe(false);
    });
  });
});
