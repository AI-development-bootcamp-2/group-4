'use strict';

const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { moderatorAccessGuard } = require('../guards/role/role.guard');
const {
  submitReport, getReports, reviewReport,
  getActivityLog,
  getPlatformStats, getTopUsers, getRegistrationTrend,
} = require('../controllers/admin.controller');

const router = Router();

// Public-ish: authenticated users can submit reports
router.post('/reports',              authenticate,                              submitReport);

// Admin + moderator access on reports
router.get('/reports',               authenticate, requireRole('admin', 'moderator'), getReports);
router.patch('/reports/:id',         authenticate, requireRole('admin', 'moderator'), reviewReport);

// Moderator content-flag endpoint — uses moderatorAccessGuard for
// fine-grained role checking aligned with content-policy permissions.
router.get('/reports/flagged',       authenticate, moderatorAccessGuard,        getReports);
router.get('/logs',                  authenticate, requireRole('admin'),              getActivityLog);
router.get('/stats',                 authenticate, requireRole('admin'),              getPlatformStats);
router.get('/stats/top-users',       authenticate, requireRole('admin'),              getTopUsers);
router.get('/stats/registrations',   authenticate, requireRole('admin'),              getRegistrationTrend);

module.exports = router;
