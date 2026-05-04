'use strict';

const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const {
  submitReport, getReports, reviewReport,
  getActivityLog,
  getPlatformStats, getTopUsers, getRegistrationTrend,
} = require('../controllers/admin.controller');

const router = Router();

// Public-ish: authenticated users can submit reports
router.post('/reports',              authenticate,                              submitReport);

// Admin-only
router.get('/reports',               authenticate, requireRole('admin', 'moderator'), getReports);
router.patch('/reports/:id',         authenticate, requireRole('admin', 'moderator'), reviewReport);
router.get('/logs',                  authenticate, requireRole('admin'),              getActivityLog);
router.get('/stats',                 authenticate, requireRole('admin'),              getPlatformStats);
router.get('/stats/top-users',       authenticate, requireRole('admin'),              getTopUsers);
router.get('/stats/registrations',   authenticate, requireRole('admin'),              getRegistrationTrend);

module.exports = router;
