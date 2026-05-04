'use strict';

/**
 * @module plugins/security.plugin
 *
 * Baseline security hardening applied to every Express response.
 *
 * Sets defensive HTTP headers manually instead of relying on the `helmet` package,
 * giving us fine-grained control over individual policies.
 *
 * Headers applied:
 *  - X-Content-Type-Options: nosniff
 *  - X-Frame-Options: SAMEORIGIN
 *  - Referrer-Policy: strict-origin-when-cross-origin
 *  - X-XSS-Protection: 1; mode=block (legacy browsers)
 *  - Cache-Control: no-store (for API responses)
 */

/**
 * Register security headers middleware.
 * @param {import('express').Application} app
 */
function registerSecurityPlugin(app) {
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
}

module.exports = { registerSecurityPlugin };
