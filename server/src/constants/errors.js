'use strict';

// Centralised error message strings — keep UI-facing messages consistent

module.exports = {
  AUTH: {
    REQUIRED: 'Authentication required',
    INVALID_TOKEN: 'Invalid or expired token',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    EMAIL_IN_USE: 'Email already in use',
    USERNAME_IN_USE: 'Username already in use',
  },
  USER: {
    NOT_FOUND: 'User not found',
    UPDATE_FORBIDDEN: 'You can only update your own profile',
    DELETE_FORBIDDEN: 'You can only delete your own account',
  },
  VALIDATION: {
    FAILED: 'Validation failed',
    REQUIRED: (field) => `${field} is required`,
  },
  FILE: {
    NO_FILE: 'No file uploaded',
    INVALID_TYPE: 'Invalid file type',
    TOO_LARGE: 'File too large',
  },
};
