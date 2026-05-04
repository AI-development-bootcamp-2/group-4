'use strict';

/**
 * @module interceptors/response.interceptor
 *
 * Response shape normalizer.
 *
 * Wraps `res.json()` to ensure every response conforms to the API envelope:
 *
 * Success:
 *   { success: true, message: string, data: any }
 *
 * Error:
 *   { success: false, message: string, code: string }
 *
 * Controllers may still call res.json() directly — this interceptor only
 * adds the envelope when the body doesn't already have a `success` key.
 */

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function responseInterceptor(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function intercept(body) {
    // Already enveloped — pass through untouched
    if (body && typeof body === 'object' && 'success' in body) {
      return originalJson(body);
    }

    // Wrap bare objects/values in success envelope
    const wrapped = {
      success: res.statusCode < 400,
      data: body,
    };

    return originalJson(wrapped);
  };

  next();
}

module.exports = responseInterceptor;
