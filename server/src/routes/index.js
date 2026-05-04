'use strict';

const { Router } = require('express');
const { healthCheck } = require('../controllers/health.controller');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

const router = Router();

router.get('/health', healthCheck);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
