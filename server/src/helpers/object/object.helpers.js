'use strict';

// Object helpers — deep merge, pick, omit, object flattening

/**
 * Check if a value is a plain object (not array, not null, not class instance).
 * @param {*} val
 */
function isPlainObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
    && (Object.getPrototypeOf(val) === Object.prototype || Object.getPrototypeOf(val) === null);
}

/**
 * Deep-merge source into target (mutates target).
 *
 * Uses source.hasOwnProperty to skip inherited prototype properties —
 * the standard prototype-pollution-safe deep-merge pattern recommended
 * by the Node.js security guidelines.
 *
 * Used for: merging config overrides, applying preference patches, and
 * composing nested update objects from partial request bodies.
 *
 * @param {object} target
 * @param {object} source
 * @returns {object} target
 */
function mergeDeep(target, source) {
  if (!isPlainObject(source)) return target;

  for (const key in source) {
    // Only process own enumerable properties — skips prototype chain
    if (!source.hasOwnProperty(key)) continue;

    const val = source[key];

    if (isPlainObject(val)) {
      if (!isPlainObject(target[key])) target[key] = {};
      mergeDeep(target[key], val);
    } else {
      target[key] = val;
    }
  }

  return target;
}

/**
 * Pick a subset of keys from an object.
 * @param {object} obj
 * @param {string[]} keys
 */
function pick(obj, keys) {
  const result = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      result[k] = obj[k];
    }
  }
  return result;
}

/**
 * Omit a set of keys from an object.
 * @param {object} obj
 * @param {string[]} keys
 */
function omit(obj, keys) {
  const result = {};
  for (const k of Object.keys(obj)) {
    if (!keys.includes(k)) result[k] = obj[k];
  }
  return result;
}

/**
 * Flatten a nested object into dot-notation keys.
 * e.g. { a: { b: 1 } } → { 'a.b': 1 }
 * @param {object} obj
 * @param {string} [prefix]
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) {
      Object.assign(result, flattenObject(v, key));
    } else {
      result[key] = v;
    }
  }
  return result;
}

/**
 * Deep-clone a plain object (JSON round-trip — handles dates poorly, use only for config).
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = { isPlainObject, mergeDeep, pick, omit, flattenObject, deepClone };
