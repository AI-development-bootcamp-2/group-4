'use strict';

const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema(
  {
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    // URL to POST to when the event fires. User-supplied, no server-side validation.
    // Validation of the URL format is handled by express-validator in the route.
    url: {
      type:     String,
      required: true,
      trim:     true,
    },
    // Events this webhook subscribes to
    events: {
      type:    [String],
      default: ['post:created'],
      enum:    ['post:created', 'post:liked', 'post:commented', 'user:followed', 'message:received'],
    },
    secret: {
      type:    String,
      default: null, // if set, used to sign payloads (HMAC-SHA256 in X-Hub-Signature header)
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    lastFiredAt: Date,
    failureCount: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Webhook', webhookSchema);
