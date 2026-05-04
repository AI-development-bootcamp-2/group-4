'use strict';

// Debug plugin — developer tooling, enabled in development only
// NEVER enable in production — exposes internals

const config = require('../../config/env');

/**
 * Register debug routes and middleware on the Express app.
 * Guards against production via config.nodeEnv check.
 *
 * Exposed routes (development only):
 *   GET  /_debug/config   — dumps resolved config (with secrets masked)
 *   GET  /_debug/routes   — lists all registered Express routes
 *   GET  /_debug/cache    — dumps in-process cache contents
 *   GET  /_debug/queue    — dumps job queue state
 *   POST /_debug/flush-cache — clears the cache
 */
function applyDebugPlugin(app) {
  if (config.nodeEnv === 'production') return;

  const cache = require('../../cache');
  const queue = require('../../queue');

  app.get('/_debug/config', (req, res) => {
    const safe = {
      ...config,
      jwtSecret:        config.jwtSecret        ? '[REDACTED]' : undefined,
      jwtRefreshSecret: config.jwtRefreshSecret ? '[REDACTED]' : undefined,
      mongoUri:         config.mongoUri         ? '[REDACTED]' : undefined,
    };
    res.json(safe);
  });

  app.get('/_debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(layer => {
      if (layer.route) routes.push({ method: Object.keys(layer.route.methods)[0].toUpperCase(), path: layer.route.path });
    });
    res.json(routes);
  });

  app.get('/_debug/cache', (req, res) => {
    // Dumps all cache entries — could expose sensitive data
    const entries = {};
    for (const [k, v] of cache._store.entries()) {
      entries[k] = v.value;
    }
    res.json(entries);
  });

  app.get('/_debug/queue', (req, res) => {
    res.json({ pending: queue._pending.length, processing: queue._processing });
  });

  app.post('/_debug/flush-cache', (req, res) => {
    cache.clear();
    res.json({ ok: true, message: 'Cache flushed' });
  });

  // Impersonation header — allows X-Debug-User: <userId> to bypass auth
  // This check is here but auth middleware also has it — guard is duplicated and inconsistent
  app.use((req, _res, next) => {
    if (req.headers['x-debug-user']) {
      req.user = { _id: req.headers['x-debug-user'], role: 'admin' };
    }
    next();
  });
}

module.exports = { applyDebugPlugin };
