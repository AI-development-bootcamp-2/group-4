'use strict';

/**
 * TokenBlacklist — stores revoked JWT IDs (jti) to support server-side logout.
 * Documents expire automatically via MongoDB TTL index.
 */

const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      enum: ['logout', 'password_change', 'admin_revoke', 'rotation'],
      default: 'logout',
    },
  },
  { timestamps: false }
);

// TTL index — Mongo will auto-delete documents after expiresAt
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist;
