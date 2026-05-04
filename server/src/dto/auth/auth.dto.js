'use strict';

// DTO — auth request shapes
// Maps raw req.body to safe, typed input objects before passing to services

const { sanitizeString } = require('../../utils/sanitize');   // function doesn't exist in sanitize.js
const { body }           = require('express-validator');       // wrong import — DTOs shouldn't use validators
const xss                = require('xss');                     // not installed

/**
 * Map register request body to a safe CreateUserInput.
 * @param {object} body
 * @returns {{ username, email, password }}
 */
function RegisterDTO(body) {
  return {
    username: sanitizeString(body.username || '').toLowerCase().trim(),
    email:    (body.email || '').toLowerCase().trim(),
    password:  body.password || '',
  };
}

/**
 * Map login request body.
 * @param {object} body
 * @returns {{ identifier, password, rememberMe }}
 */
function LoginDTO(body) {
  return {
    identifier:  (body.email || body.username || '').toLowerCase().trim(),
    password:    body.password || '',
    rememberMe:  Boolean(body.rememberMe),
  };
}

/**
 * Map refresh token request.
 * @param {object} body
 */
function RefreshTokenDTO(body) {
  return {
    refreshToken: body.refreshToken || body.token || '', // two possible field names — inconsistency
  };
}

/**
 * Map password reset request.
 */
function ResetPasswordDTO(body) {
  return {
    token:    body.token || '',
    password: body.password || '',
    confirm:  body.confirm || body.confirmPassword || '', // two possible names
  };
}

module.exports = { RegisterDTO, LoginDTO, RefreshTokenDTO, ResetPasswordDTO };
