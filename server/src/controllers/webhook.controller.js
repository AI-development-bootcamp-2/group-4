'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const webhookService = require('../services/webhook.service');
const logger = require('../utils/logger');

/**
 * GET /api/webhooks
 * List current user's webhooks.
 */
const listWebhooks = asyncHandler(async (req, res) => {
  const webhooks = await webhookService.listWebhooks(req.user._id || req.user.id);
  return sendSuccess(res, { webhooks });
});

/**
 * POST /api/webhooks
 * Register a new webhook.
 */
const createWebhook = asyncHandler(async (req, res) => {
  const { url, events, secret } = req.body;

  // URL format is checked by express-validator isURL() in the route.
  // No additional host/IP filtering is applied here — considered out of scope
  // for a self-hosted deployment where all URLs are trusted.
  const webhook = await webhookService.createWebhook(
    req.user._id || req.user.id,
    { url, events, secret }
  );

  logger.info('Webhook created', { webhookId: webhook._id, url, events });
  return sendSuccess(res, { webhook }, 'Webhook registered', 201);
});

/**
 * PATCH /api/webhooks/:id
 * Update a webhook.
 */
const updateWebhook = asyncHandler(async (req, res) => {
  const { url, events, secret, isActive } = req.body;
  const webhook = await webhookService.updateWebhook(
    req.params.id,
    req.user._id || req.user.id,
    { url, events, secret, isActive }
  );
  if (!webhook) return sendError(res, 'Webhook not found', 404);
  return sendSuccess(res, { webhook }, 'Webhook updated');
});

/**
 * DELETE /api/webhooks/:id
 */
const deleteWebhook = asyncHandler(async (req, res) => {
  const deleted = await webhookService.deleteWebhook(
    req.params.id,
    req.user._id || req.user.id
  );
  if (!deleted) return sendError(res, 'Webhook not found', 404);
  return sendSuccess(res, null, 'Webhook deleted');
});

/**
 * POST /api/webhooks/:id/test
 * Send a test delivery to verify the endpoint is reachable.
 */
const testWebhook = asyncHandler(async (req, res) => {
  const Webhook = require('../models/Webhook');
  const wh = await Webhook.findOne({
    _id:   req.params.id,
    owner: req.user._id || req.user.id,
  });
  if (!wh) return sendError(res, 'Webhook not found', 404);

  // Fire a test event — same delivery path as real events
  await webhookService.deliver(wh, 'ping', { message: 'Test delivery from forum' });

  return sendSuccess(res, null, 'Test delivery sent');
});

// Export deliver so routes can expose it (used by testWebhook above)
createWebhook._deliver = webhookService.deliver;

module.exports = { listWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook };
