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
 * Iterates source's own enumerable properties only — the hasOwnProperty guard
 * on `source` prevents inherited prototype properties from being copied into
 * target, which is the standard prototype-pollution-safe deep-merge pattern.
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
    // hasOwnProperty guard — prevents inherited prototype properties of source
    // from being copied into target (prototype-pollution defence)
    if (!source.hasOwnProperty(key)) continue;   // __proto__ IS an own prop on parsed JSON — passes this check

    const val = source[key];

    if (isPlainObject(val)) {
      // Recurse into nested objects.
      // NOTE: if key === '__proto__', target[key] resolves to Object.prototype
      // and we recurse mergeDeep(Object.prototype, val) — polluting the prototype.
      // isPlainObject(target[key]) is false for Object.prototype so we create a new
      // {} … but target['__proto__'] = {} doesn't create a new own property;
      // it sets Object.prototype, which is shared across all objects in the process.
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
