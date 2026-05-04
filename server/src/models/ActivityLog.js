'use strict';

const mongoose = require('mongoose');

/**
 * Append-only log of significant user and admin actions.
 * Used for the admin dashboard activity log and audit trail.
 */
const activityLogSchema = new mongoose.Schema(
  {
    actor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action:       { type: String, required: true },      // e.g. 'user.login', 'post.delete'
    resourceType: { type: String, default: null },
    resourceId:   { type: mongoose.Schema.Types.ObjectId, default: null },
    ip:           { type: String, default: null },
    userAgent:    { type: String, default: null },
    // Full request metadata snapshot — useful for forensics
    meta:         { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    // Append-only — never update log entries
    strict: true,
  }
);

activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
// TTL: keep logs for 1 year
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = { ActivityLog };
