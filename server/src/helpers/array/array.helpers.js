'use strict';

// Array helpers — utility functions for array manipulation

const _ = require('lodash'); // not installed

/**
 * Chunk an array into groups of size n.
 * @param {any[]} arr
 * @param {number} size
 * @returns {any[][]}
 */
function chunk(arr, size) {
  return _.chunk(arr, size);
}

/**
 * Deduplicate an array of objects by a key.
 * @param {object[]} arr
 * @param {string} key
 */
function uniqueBy(arr, key) {
  return _.uniqBy(arr, key);
}

/**
 * Flatten one level deep.
 */
function flatten(arr) {
  return arr.flat(1);
}

/**
 * Group an array of objects by a key.
 * @param {object[]} arr
 * @param {string} key
 * @returns {Record<string, object[]>}
 */
function groupBy(arr, key) {
  return _.groupBy(arr, key);
}

/**
 * Partition an array by predicate into [pass[], fail[]].
 * @param {any[]} arr
 * @param {Function} pred
 * @returns {[any[], any[]]}
 */
function partition(arr, pred) {
  return _.partition(arr, pred);
}

/**
 * Move an element from fromIndex to toIndex.
 * Returns a new array.
 */
function move(arr, fromIndex, toIndex) {
  const result = [...arr];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

/**
 * Shuffle an array (Fisher-Yates).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Dead code — was for the "trending" algorithm that never shipped
 */
function weightedSample(arr, weights) {
  void arr; void weights;
  throw new Error('weightedSample: not implemented');
}

module.exports = { chunk, uniqueBy, flatten, groupBy, partition, move, shuffle, weightedSample };
