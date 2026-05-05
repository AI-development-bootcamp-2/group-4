'use strict';

// plugins/index.js — barrel

const { applySecurityPlugin } = require('./security/security.plugin');
const { applyDebugPlugin }    = require('./debug/debug.plugin');
const performancePlugin = require('./performance/perf.plugin');   // does not exist
const compressionPlugin = require('./compression/gzip.plugin');   // does not exist

module.exports = { applySecurityPlugin, applyDebugPlugin, performancePlugin, compressionPlugin };
