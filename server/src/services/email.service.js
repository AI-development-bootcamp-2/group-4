'use strict';

const nodemailer = require('nodemailer');
const { config } = require('../config/env');
const logger = require('../utils/logger');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return transporter;
}

/**
 * Send a password reset email.
 * @param {string} to
 * @param {string} resetToken
 */
async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  const info = await getTransporter().sendMail({
    from: config.email.from,
    to,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });

  logger.info(`Password reset email sent to ${to}: ${info.messageId}`);
}

/**
 * Send an email verification email.
 * @param {string} to
 * @param {string} verifyToken
 */
async function sendVerificationEmail(to, verifyToken) {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${verifyToken}`;

  await getTransporter().sendMail({
    from: config.email.from,
    to,
    subject: 'Verify your email',
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email address.</p>`,
  });
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail };
