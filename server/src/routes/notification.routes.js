'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
} = require('../controllers/notification.controller');

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/',                    getNotifications);
router.get('/unread-count',        getUnreadCount);
router.patch('/read-all',          markAllRead);
router.patch('/:id/read',          markRead);
router.delete('/',                 deleteAllNotifications);
router.delete('/:id',              deleteNotification);

module.exports = router;
