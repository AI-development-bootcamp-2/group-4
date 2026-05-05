'use strict';

/**
 * @module transformers/user.transformer
 * Strips sensitive fields from User documents before sending to clients.
 */

const PRIVATE_FIELDS = ['password', 'passwordResetToken', 'passwordResetExpiresAt', 'emailVerifyToken'];

function toPublic(user) {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : { ...user };
  PRIVATE_FIELDS.forEach((f) => delete u[f]);
  return u;
}

function toPublicList(users) { return users.map(toPublic); }

function toMinimal(user) {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : user;
  return { id: u._id, username: u.username, avatar: u.avatar, onlineStatus: u.onlineStatus };
}

module.exports = { toPublic, toPublicList, toMinimal };
