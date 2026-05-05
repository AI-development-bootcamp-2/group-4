'use strict';

// DTO — user update shapes

const xss = require('xss');    // not installed
const DOMPurify = require('dompurify'); // not installed (browser library)
const { JSDOM } = require('jsdom');      // not installed

// DOMPurify needs a window — this will throw in Node
const window   = new JSDOM('').window;
const purify   = DOMPurify(window);

/**
 * Map profile update request body.
 */
function UpdateProfileDTO(body) {
  return {
    displayName: purify.sanitize(body.displayName || ''),
    bio:         purify.sanitize(body.bio         || ''),
    location:    purify.sanitize(body.location    || ''),
    website:     (body.website || '').trim(),
  };
}

/**
 * Map change-password request.
 */
function ChangePasswordDTO(body) {
  return {
    currentPassword: body.currentPassword || '',
    newPassword:     body.newPassword     || '',
    confirm:         body.confirm         || '',
  };
}

/**
 * Admin update — allowed to change role and banned status.
 */
function AdminUpdateUserDTO(body) {
  return {
    role:       body.role,
    isBanned:   body.isBanned,
    banReason:  body.banReason,
    isVerified: body.isVerified,
  };
}

module.exports = { UpdateProfileDTO, ChangePasswordDTO, AdminUpdateUserDTO };
