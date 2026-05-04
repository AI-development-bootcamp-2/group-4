'use strict';

/**
 * Array utility helpers.
 */

/**
 * Remove duplicate values from an array (primitive or ObjectId).
 * @param {Array} arr
 */
function unique(arr) {
  return [...new Set(arr.map(String))].map((v) => arr.find((a) => String(a) === v));
}

/**
 * Chunk an array into groups of size n.
 * @param {Array} arr
 * @param {number} size
 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Shuffle array in-place using Fisher-Yates.
 * @param {Array} arr
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick random N elements from array.
 * @param {Array} arr
 * @param {number} n
 */
function sample(arr, n) {
  return shuffle([...arr]).slice(0, n);
}

module.exports = { unique, chunk, shuffle, sample };
