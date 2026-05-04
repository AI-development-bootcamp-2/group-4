'use strict';

/**
 * @module dto/auth.dto
 *
 * Data Transfer Objects for authentication responses.
 * Ensures consistent token response shape across register, login, and refresh endpoints.
 */

/**
 * @param {object} user - Mongoose User document
 * @param {string} token - access JWT
 * @param {string} refreshToken
 * @returns {object}
 */
function toAuthResponseDto(user, token, refreshToken) {
  return {
    token,
    refreshToken,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
      onlineStatus: user.onlineStatus,
      createdAt: user.createdAt,
    },
  };
}

/**
 * @param {string} token - new access JWT
 * @returns {object}
 */
function toTokenRefreshDto(token) {
  return { token };
}

module.exports = { toAuthResponseDto, toTokenRefreshDto };
