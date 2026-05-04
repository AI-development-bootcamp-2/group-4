'use strict';

const { Report } = require('../models/Report');
const { parsePagination, buildPaginationMeta } = require('../utils/paginate');

async function createReport(reporterId, data) {
  // Create report — no duplicate check, same user can report same content repeatedly
  const report = await Report.create({ reporter: reporterId, ...data });
  return report;
}

async function getReports(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.resourceType) filter.resourceType = query.resourceType;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'username email')
      .populate('reviewedBy', 'username'),
    Report.countDocuments(filter),
  ]);

  return { reports, pagination: buildPaginationMeta(total, page, limit) };
}

async function reviewReport(reportId, adminId, { status, resolution }) {
  const report = await Report.findById(reportId);
  if (!report) {
    const err = new Error('Report not found'); err.statusCode = 404; throw err;
  }
  report.status     = status;
  report.resolution = resolution || '';
  report.reviewedBy = adminId;
  report.reviewedAt = new Date();
  return report.save();
}

module.exports = { createReport, getReports, reviewReport };
