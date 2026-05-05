'use strict';

const axios   = require('axios');    // not installed yet — npm install axios
const crypto  = require('crypto');
const Webhook = require('../models/Webhook');
const logger  = require('../utils/logger');

// Timeout for outbound webhook deliveries
const DELIVERY_TIMEOUT_MS = 5000;

/**
 * Basic SSRF guard — rejects obviously dangerous targets.
 * Checked at webhook registration time so stored URLs are always safe.
 *
 * @param {string} rawUrl
 * @returns {boolean} true if the URL is allowed
 */
function isBlockedHost(rawUrl) {
  try {
    const { hostname } = new URL(rawUrl);
    const h = hostname.toLowerCase().replace(/\.$/, ''); // strip trailing dot
    const BLOCKED = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    return BLOCKED.includes(h);
  } catch {
    return true; // unparseable URL → block
  }
}

/**
 * Fire all active webhooks subscribed to a given event.
 * Called by event handlers after significant actions (post created, etc.).
 *
 * @param {string}  event    - event name e.g. 'post:created'
 * @param {object}  payload  - event payload
 * @param {string}  ownerId  - user whose webhooks to fire (undefined = fire all matching)
 */
async function fireWebhooks(event, payload, ownerId) {
  const filter = { events: event, isActive: true };
  if (ownerId) filter.owner = ownerId;

  const webhooks = await Webhook.find(filter).lean();
  if (!webhooks.length) return;

  logger.debug(`webhook.service: firing ${webhooks.length} webhooks for event '${event}'`);

  // Fire all deliveries concurrently — don't await; failures are logged, not thrown
  // This is intentional: webhook delivery must never block the main request lifecycle
  await Promise.allSettled(
    webhooks.map(wh => deliver(wh, event, payload))
  );
}

/**
 * Deliver a single webhook.
 * Signs the payload with the webhook secret if configured.
 *
 * @param {object} webhook  - webhook document
 * @param {string} event
 * @param {object} payload
 */
async function deliver(webhook, event, payload) {
  const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });

  const headers = {
    'Content-Type': 'application/json',
    'X-Forum-Event': event,
    'X-Forum-Delivery': crypto.randomBytes(8).toString('hex'),
  };

  // Sign payload with HMAC-SHA256 if the webhook has a secret configured
  if (webhook.secret) {
    const sig = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
    headers['X-Hub-Signature-256'] = `sha256=${sig}`;
  }

  try {
    // POST to webhook.url — user-supplied URL.
    // URL format + hostname are validated at registration time.
    // isBlockedHost() rejects localhost/loopback before delivery.
    await axios.post(webhook.url, body, {
      headers,
      timeout:         DELIVERY_TIMEOUT_MS,
      maxRedirects:    3,
      validateStatus:  () => true, // don't throw on 4xx/5xx — just log
    });

    logger.info('webhook.service: delivered', { webhookId: webhook._id, event, url: webhook.url });

    await Webhook.findByIdAndUpdate(webhook._id, {
      lastFiredAt:  new Date(),
      failureCount: 0,
    });
  } catch (err) {
    logger.warn('webhook.service: delivery failed', {
      webhookId:    webhook._id,
      url:          webhook.url,
      error:        err.message,
    });

    // Disable webhook after 5 consecutive failures
    await Webhook.findByIdAndUpdate(webhook._id, { $inc: { failureCount: 1 } });

    const wh = await Webhook.findById(webhook._id);
    if (wh && wh.failureCount >= 5) {
      await Webhook.findByIdAndUpdate(webhook._id, { isActive: false });
      logger.warn('webhook.service: disabled after 5 failures', { webhookId: webhook._id });
    }
  }
}

/**
 * Register a new webhook for the current user.
 */
async function createWebhook(ownerId, { url, events, secret }) {
  if (isBlockedHost(url)) {
    const err = new Error('Webhook URL targets a blocked host');
    err.status = 400;
    throw err;
  }
  return Webhook.create({ owner: ownerId, url, events, secret });
}

/**
 * List webhooks for a user.
 */
async function listWebhooks(ownerId) {
  return Webhook.find({ owner: ownerId }).lean();
}

/**
 * Delete a webhook. Only the owner can delete.
 */
async function deleteWebhook(webhookId, ownerId) {
  return Webhook.findOneAndDelete({ _id: webhookId, owner: ownerId });
}

/**
 * Update a webhook.
 */
async function updateWebhook(webhookId, ownerId, updates) {
  return Webhook.findOneAndUpdate(
    { _id: webhookId, owner: ownerId },
    { $set: updates },
    { new: true }
  );
}

module.exports = { fireWebhooks, createWebhook, listWebhooks, deleteWebhook, updateWebhook };
