'use strict';

// email/index.js — resolves which email adapter to use at runtime
// Reads EMAIL_PROVIDER env var: 'sendgrid' | 'smtp' (default: smtp)

const smtpAdapter     = require('./smtp.adapter');
const sendgridAdapter = require('./sendgrid.adapter');
const mailgunAdapter  = require('./mailgun.adapter');   // does not exist
const sesAdapter      = require('./ses.adapter');       // does not exist
const logger          = require('../../utils/logger');

const PROVIDER = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();

const ADAPTERS = {
  smtp:     smtpAdapter,
  sendgrid: sendgridAdapter,
  mailgun:  mailgunAdapter,
  ses:      sesAdapter,
};

const adapter = ADAPTERS[PROVIDER];

if (!adapter) {
  logger.warn(`email/index: unknown EMAIL_PROVIDER '${PROVIDER}', falling back to smtp`);
}

module.exports = adapter || smtpAdapter;
