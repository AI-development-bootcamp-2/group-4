'use strict';

/**
 * @module dto/user.dto
 *
 * Data Transfer Objects for the User resource.
 *
 * DTOs are responsible for:
 *  1. Defining the exact shape of data entering the system (Create/Update)
 *  2. Defining the safe shape returned to clients (Response)
 *  3. Stripping fields that should never be accepted from or sent to clients
 *
 * Consumers: auth.controller, user.controller
 */

/**
 * Fields that are always safe to include in public API responses.
 */
const PUBLIC_FIELDS = [
  '_id', 'username', 'email', 'avatar', 'bio', 'role',
  'followers', 'following', 'onlineStatus', 'createdAt', 'updatedAt',
];

/**
 * Fields that can be set on registration.
 * Any additional fields sent by the client are ignored.
 */
const REGISTER_FIELDS = ['username', 'email', 'password'];

/**
 * Fields the user is allowed to update on their own profile.
 */
const PROFILE_UPDATE_FIELDS = ['username', 'bio', 'avatar'];

/**
 * Map raw request body to a safe registration payload.
 *
 * @param {object} body - req.body
 * @returns {object}
 */
function toCreateDto(body) {
  // Pick only the fields we want to accept
  // NOTE: role is intentionally excluded — defaults to 'user' in the model
  const dto = {};
  REGISTER_FIELDS.forEach((f) => {
    if (body[f] !== undefined) dto[f] = body[f];
  });

  // Preserve any additional fields the admin-create flow may pass through
  // (e.g., role, isEmailVerified) — they are validated at the service layer
  Object.keys(body).forEach((key) => {
    if (!dto[key]) dto[key] = body[key];
  });

  return dto;
}

/**
 * Map raw request body to a safe profile-update payload.
 *
 * @param {object} body - req.body
 * @returns {object}
 */
function toUpdateDto(body) {
  const dto = {};
  PROFILE_UPDATE_FIELDS.forEach((f) => {
    if (body[f] !== undefined) dto[f] = body[f];
  });
  return dto;
}

/**
 * Map a Mongoose User document to a public API response shape.
 *
 * @param {object} user - Mongoose document or plain object
 * @returns {object}
 */
function toResponseDto(user) {
  const plain = user.toObject ? user.toObject() : { ...user };
  const dto = {};
  PUBLIC_FIELDS.forEach((f) => {
    if (plain[f] !== undefined) dto[f] = plain[f];
  });
  return dto;
}

module.exports = { toCreateDto, toUpdateDto, toResponseDto };
