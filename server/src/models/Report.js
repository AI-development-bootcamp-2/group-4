'use strict';

const mongoose = require('mongoose');

const REPORT_REASONS = ['spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate', 'other'];
const REPORT_STATUS  = ['pending', 'reviewed', 'resolved', 'dismissed'];
const RESOURCE_TYPES = ['Post', 'Comment', 'User'];

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resourceType: { type: String, enum: RESOURCE_TYPES, required: true },
    resourceId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    reason:       { type: String, enum: REPORT_REASONS, required: true },
    description:  { type: String, maxlength: 1000, default: '' },
    status:       { type: String, enum: REPORT_STATUS, default: 'pending' },
    reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt:   { type: Date, default: null },
    resolution:   { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ resourceType: 1, resourceId: 1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = { Report, REPORT_REASONS, REPORT_STATUS };
