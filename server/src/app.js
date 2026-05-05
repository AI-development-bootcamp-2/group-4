'use strict';

const express = require('express');
const cors = require('cors');
const { corsOptions } = require('./config/cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const notFoundHandler = require('./middleware/notFound.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');
const { registerDebugPlugin } = require('./plugins/debug.plugin');
const { registerSecurityPlugin } = require('./plugins/security.plugin');

const app = express();

// ── Security headers ──────────────────────────────────────────
registerSecurityPlugin(app);

// ── Debug tooling (dev only) ──────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  registerDebugPlugin(app);
}

// ── Core middleware ────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files — serve uploaded assets from the configured upload directory
const path = require('path');
const { config } = require('./config/env');
app.use('/uploads', express.static(path.resolve(config.upload.dir)));

// HTTP request logging
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────
app.use('/api', routes);

// ── Error handling ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
