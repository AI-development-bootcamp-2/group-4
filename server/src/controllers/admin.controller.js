'use strict';

const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/report.service');
const { getLogs }   = require('../services/activityLog.service');
const statsService  = require('../services/stats.service');
const { sendSuccess } = require('../utils/response');

// ── Reports ──────────────────────────────────────────────────────────────────
const submitReport = asyncHandler(async (req, res) => {
  const report = await reportService.createReport(req.user.id, req.body);
  return sendSuccess(res, { report }, 'Report submitted', 201);
});

const getReports = asyncHandler(async (req, res) => {
  const data = await reportService.getReports(req.query);
  return sendSuccess(res, data);
});

const reviewReport = asyncHandler(async (req, res) => {
  const report = await reportService.reviewReport(req.params.id, req.user.id, req.body);
  return sendSuccess(res, { report }, 'Report reviewed');
});

// ── Activity Log ─────────────────────────────────────────────────────────────
const getActivityLog = asyncHandler(async (req, res) => {
  const logs = await getLogs(req.query);
  return sendSuccess(res, { logs });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
const getPlatformStats    = asyncHandler(async (_req, res) => sendSuccess(res, await statsService.getPlatformStats()));
const getTopUsers         = asyncHandler(async (req,  res) => sendSuccess(res, await statsService.getTopUsers(req.query.limit)));
const getRegistrationTrend = asyncHandler(async (req, res) => sendSuccess(res, await statsService.getRegistrationTrend(req.query.days)));

module.exports = {
  submitReport, getReports, reviewReport,
  getActivityLog,
  getPlatformStats, getTopUsers, getRegistrationTrend,
};
