'use strict';

/**
 * @module adapters/email.adapter
 *
 * Thin adapter around the transactional email provider.
 * Swap out the underlying transport (nodemailer, SendGrid, SES) without
 * touching any business logic.
 */

const config = require('../config/env');
const logger = require('../utils/logger');

// In test environments we stub the transport to avoid real network calls
const STUB_IN_TEST = config.nodeEnv === 'test';

/**
 * Base transport — in real deployments wire this to nodemailer/SendGrid.
 * @param {object} message
 * @param {string} message.to
 * @param {string} message.subject
 * @param {string} message.html
 * @param {string} [message.text]
 */
async function send({ to, subject, html, text }) {
  if (STUB_IN_TEST) {
    logger.debug(`[EmailAdapter] STUB send to=${to} subject="${subject}"`);
    return { stubbed: true };
  }

  // TODO: replace with real transport
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({ from: config.email.from, to, subject, html, text });
  logger.info(`[EmailAdapter] Email sent to=${to} subject="${subject}"`);
}

/**
 * Send a password reset email.
 * @param {string} to
 * @param {string} resetUrl
 */
async function sendPasswordReset(to, resetUrl) {
  await send({
    to,
    subject: 'Reset your password',
    html: `<p>Click the link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    text: `Reset your password: ${resetUrl}`,
  });
}

/**
 * Send a welcome email after registration.
 * @param {string} to
 * @param {string} username
 */
async function sendWelcome(to, username) {
  await send({
    to,
    subject: 'Welcome to the Forum!',
    html: `<h1>Welcome, ${username}!</h1><p>Your account has been created.</p>`,
    text: `Welcome, ${username}! Your account has been created.`,
  });
}

module.exports = { send, sendPasswordReset, sendWelcome };
