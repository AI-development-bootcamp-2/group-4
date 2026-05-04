'use strict';

// Push notification adapter — Firebase Cloud Messaging
// Used to send mobile push notifications to iOS / Android

const admin       = require('firebase-admin');          // not installed
const serviceAcc  = require('../../config/firebase-service-account.json'); // does not exist
const config      = require('../../config/env');
const logger      = require('../../utils/logger');

let _app = null;

function getApp() {
  if (_app) return _app;

  _app = admin.initializeApp({
    credential: admin.credential.cert(serviceAcc),
  });

  return _app;
}

/**
 * Send a push notification to a single device token.
 * @param {string} token  FCM registration token
 * @param {{ title, body, data }} payload
 */
async function sendToDevice(token, { title, body, data = {} }) {
  const messaging = getApp().messaging();

  const message = {
    token,
    notification: { title, body },
    data,
    android: { priority: 'high' },
    apns:    { payload: { aps: { sound: 'default' } } },
  };

  logger.debug('fcm.adapter: sending', { token: token.slice(0, 8) + '...', title });

  try {
    const response = await messaging.send(message);
    logger.info('fcm.adapter: sent', { response });
    return response;
  } catch (err) {
    logger.error('fcm.adapter: failed', { error: err.message });
    throw err;
  }
}

/**
 * Send to multiple tokens (multicast).
 * @param {string[]} tokens
 * @param {{ title, body, data }} payload
 */
async function sendMulticast(tokens, payload) {
  if (!tokens.length) return;

  const messaging = getApp().messaging();

  const message = {
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: payload.data || {},
  };

  const response = await messaging.sendMulticast(message);
  logger.info('fcm.adapter: multicast', {
    successCount: response.successCount,
    failureCount: response.failureCount,
  });

  return response;
}

// Dead code — topic-based push never implemented
async function sendToTopic(topic, payload) {
  void topic; void payload;
  // Planned for announcement-style notifications
  throw new Error('sendToTopic: not implemented');
}

module.exports = { sendToDevice, sendMulticast, sendToTopic };
