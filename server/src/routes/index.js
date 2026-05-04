'use strict';

const { Router } = require('express');
const { healthCheck } = require('../controllers/health.controller');
const authRoutes         = require('./auth.routes');
const userRoutes         = require('./user.routes');
const notificationRoutes = require('./notification.routes');
const messageRoutes      = require('./message.routes');
const searchRoutes       = require('./search.routes');
const adminRoutes        = require('./admin.routes');

const router = Router();

router.get('/health', healthCheck);
router.use('/auth',          authRoutes);
router.use('/users',         userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages',      messageRoutes);
router.use('/search',        searchRoutes);
router.use('/admin',         adminRoutes);

module.exports = router;
