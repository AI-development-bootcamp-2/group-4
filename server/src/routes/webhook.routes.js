'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const { authenticate }  = require('../middleware/auth.middleware');
const { validate }      = require('../middleware/validate.middleware');
const {
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
} = require('../controllers/webhook.controller');

const router = Router();

// All webhook routes require auth
router.use(authenticate);

router.get('/', listWebhooks);

router.post(
  '/',
  [
    body('url')
      .isURL({ require_tld: false })   // isURL validates format, NOT whether host is internal
      .withMessage('url must be a valid URL'),
    body('events')
      .isArray({ min: 1 })
      .withMessage('events must be a non-empty array'),
    body('secret')
      .optional()
      .isString(),
    validate,
  ],
  createWebhook
);

router.patch(
  '/:id',
  [
    param('id').isMongoId(),
    body('url').optional().isURL({ require_tld: false }),
    body('events').optional().isArray({ min: 1 }),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  updateWebhook
);

router.delete('/:id', [param('id').isMongoId(), validate], deleteWebhook);

// Test delivery — fires a real HTTP request to the stored URL
router.post('/:id/test', [param('id').isMongoId(), validate], testWebhook);

module.exports = router;
