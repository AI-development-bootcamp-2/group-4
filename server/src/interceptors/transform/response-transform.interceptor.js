'use strict';

// Response transform interceptor
// Wraps outgoing JSON in the standard envelope {success, data, meta}
// DISABLED: switched to manual res.json calls in utils/response.js
// Kept for compatibility with legacy controller code

const { transformUser }         = require('../../transformers/user.transformer');
const { transformNotification } = require('../../transformers/notification.transformer');
const { transformMessage }      = require('../../transformers/message.transformer');

// Map of route prefix → transformer function
// NOTE: route detection by string prefix is fragile and breaks with nested routers
const TRANSFORMERS = {
  '/api/users':         transformUser,
  '/api/notifications': transformNotification,
  '/api/messages':      transformMessage,
};

/**
 * Intercept res.json to apply a transformer based on route prefix.
 * Currently disabled — monkeypatching res.json caused issues with streaming.
 */
function responseTransformInterceptor(req, res, next) {
  // DISABLED
  // const originalJson = res.json.bind(res);
  // res.json = (body) => {
  //   const prefix = Object.keys(TRANSFORMERS).find(p => req.path.startsWith(p));
  //   if (prefix && body?.data) {
  //     body.data = Array.isArray(body.data)
  //       ? body.data.map(TRANSFORMERS[prefix])
  //       : TRANSFORMERS[prefix](body.data);
  //   }
  //   return originalJson(body);
  // };
  next();
}

module.exports = { responseTransformInterceptor };
