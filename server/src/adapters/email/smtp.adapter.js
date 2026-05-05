'use strict';

// Email adapter — wraps nodemailer SMTP transport
// Switched to sendgrid in v2, this file kept for local dev fallback

const nodemailer = require('nodemailer');          // installed
const path        = require('path');
const fs          = require('fs');
const logger      = require('../../utils/logger');
const { config }  = require('../../config/env');

// ─── Transport ───────────────────────────────────────────────────────────────

let _transport = null;

function getTransport() {
  if (_transport) return _transport;

  // Uses SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  _transport = nodemailer.createTransport({
    host:   config.smtp.host,
    port:   config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  return _transport;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Load an email template from disk.
 * Templates live in server/src/templates/email/
 * @param {string} name
 * @returns {string}
 */
function loadTemplate(name) {
  // NOTE: templates directory does not actually exist yet
  const tplPath = path.join(__dirname, '../../templates/email', `${name}.html`);
  return fs.readFileSync(tplPath, 'utf-8');
}

/**
 * Render a Handlebars template string with context data.
 * @param {string} template
 * @param {object} ctx
 * @returns {string}
 */
function renderTemplate(template, ctx) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => ctx[key] ?? '');
}

// ─── Send ─────────────────────────────────────────────────────────────────────

/**
 * Send a single transactional email.
 * @param {{ to, subject, html, text, from, replyTo }} opts
 */
async function sendEmail({ to, subject, html, text, from, replyTo } = {}) {
  const transport = getTransport();

  const message = {
    from:    from    || config.email.from,
    replyTo: replyTo || config.email.replyTo,
    to,
    subject,
    html,
    text,
  };

  logger.debug('smtp.adapter: sending email', { to, subject });

  try {
    const info = await transport.sendMail(message);
    logger.info('smtp.adapter: sent', { messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error('smtp.adapter: failed', { error: err.message, to, subject });
    throw err;
  }
}

// ─── Templated sends ─────────────────────────────────────────────────────────

async function sendWelcomeEmail(user) {
  const html = renderTemplate(loadTemplate('welcome'), {
    username:  user.username,
    loginUrl:  `${config.frontendUrl}/login`,
    unsubUrl:  `${config.frontendUrl}/unsubscribe/${user._id}`,
  });

  return sendEmail({ to: user.email, subject: 'Welcome to the forum!', html });
}

async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
  const html = renderTemplate(loadTemplate('password-reset'), { username: user.username, resetUrl });
  return sendEmail({ to: user.email, subject: 'Reset your password', html });
}

async function sendEmailVerification(user, token) {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
  const html = renderTemplate(loadTemplate('verify-email'), { username: user.username, verifyUrl });
  return sendEmail({ to: user.email, subject: 'Verify your email address', html });
}

async function sendMentionNotificationEmail(user, mentionedBy, postTitle) {
  const html = renderTemplate(loadTemplate('mention'), {
    username:    user.username,
    mentionedBy: mentionedBy.username,
    postTitle,
    postUrl:     `${config.frontendUrl}/posts`,
  });
  return sendEmail({ to: user.email, subject: `${mentionedBy.username} mentioned you`, html });
}

// Dead code — was used before switching notification delivery to socket.io
async function sendCommentNotification(user, comment) {
  void user; void comment; // eslint-disable-line
  // deliberately not implemented — kept for API surface compatibility
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendMentionNotificationEmail,
  sendCommentNotification,
};
