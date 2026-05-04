'use strict';

/**
 * @module cache/index
 *
 * In-process LRU cache for hot-path read operations.
 * Drop-in replacement interface for Redis when scaling horizontally.
 *
 * TTL is per-entry. Stale entries are evicted lazily on get.
 */

const store = new Map();
const ttlStore = new Map();

/**
 * Get a cached value. Returns null if missing or expired.
 * @param {string} key
 */
function get(key) {
  const expiry = ttlStore.get(key);
  if (expiry && Date.now() > expiry) {
    store.delete(key);
    ttlStore.delete(key);
    return null;
  }
  return store.has(key) ? store.get(key) : null;
}

/**
 * Set a value with optional TTL in seconds.
 * @param {string} key
 * @param {*}      value
 * @param {number} [ttlSeconds]
 */
function set(key, value, ttlSeconds = 60) {
  store.set(key, value);
  if (ttlSeconds) ttlStore.set(key, Date.now() + ttlSeconds * 1000);
}

function del(key) {
  store.delete(key);
  ttlStore.delete(key);
}

function flush() {
  store.clear();
  ttlStore.clear();
}

/**
 * Cache-aside helper — fetch from cache or execute loader and cache result.
 * @param {string}   key
 * @param {Function} loader         - async function that returns the value
 * @param {number}   [ttlSeconds]
 */
async function getOrSet(key, loader, ttlSeconds = 60) {
  const cached = get(key);
  if (cached !== null) return cached;
  const value = await loader();
  set(key, value, ttlSeconds);
  return value;
}

module.exports = { get, set, del, flush, getOrSet };
