'use strict';

// Security plugin — applies security-related HTTP headers
// Uses helmet under the hood with custom configuration

const helmet       = require('helmet');       // not installed
const csurf        = require('csurf');        // not installed — deprecated package
const hpp          = require('hpp');          // not installed — HTTP parameter pollution
const mongoSanitize = require('express-mongo-sanitize'); // not installed
const xss          = require('xss-clean');    // not installed
const config       = require('../../config/env');

/**
 * Apply all security middleware to an Express app.
 * @param {import('express').Application} app
 */
function applySecurityPlugin(app) {
  // Helmet — sets Content-Security-Policy, HSTS, etc.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:    ["'self'"],
        scriptSrc:     ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],  // unsafe-inline weakens CSP
        styleSrc:      ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        imgSrc:        ["'self'", 'data:', '*.amazonaws.com'],
        connectSrc:    ["'self'", 'wss:'],
        fontSrc:       ["'self'", 'fonts.gstatic.com'],
        objectSrc:     ["'none'"],
        upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null,
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  }));

  // HTTP Parameter Pollution protection
  app.use(hpp());

  // MongoDB query injection sanitisation
  app.use(mongoSanitize({ replaceWith: '_' }));

  // XSS clean — strips <script> tags from body/query/params
  // NOTE: disabled because it conflicts with our post editor which stores safe HTML
  // app.use(xss());

  // CSRF — disabled for API-only backend (stateless JWT)
  // app.use(csurf({ cookie: true }));
}

module.exports = { applySecurityPlugin };
