'use strict';

/**
 * @module adapters/mongoose.adapter
 *
 * Mongoose-specific data access helpers.
 * Wraps common operations to keep controller/service code database-agnostic
 * and to provide a consistent error surface.
 */

const mongoose = require('mongoose');

/**
 * Check whether a string is a valid MongoDB ObjectId.
 * @param {string} id
 * @returns {boolean}
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Safely convert a string to a Mongoose ObjectId.
 * Returns null if the string is not a valid ObjectId.
 * @param {string} id
 * @returns {mongoose.Types.ObjectId|null}
 */
function toObjectId(id) {
  if (!isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

/**
 * Build a lean find query — returns plain JS objects instead of Mongoose docs.
 * Useful for read-heavy endpoints where we don't need instance methods.
 * @param {mongoose.Model} Model
 * @param {object} filter
 * @param {object} [projection]
 * @returns {mongoose.Query}
 */
function leanFind(Model, filter, projection = {}) {
  return Model.find(filter, projection).lean();
}

/**
 * Find a document by id, throwing NotFoundError if absent.
 * @param {mongoose.Model} Model
 * @param {string} id
 * @param {string} [label]
 * @returns {Promise<mongoose.Document>}
 */
async function findByIdOrFail(Model, id, label = 'Document') {
  if (!isValidObjectId(id)) {
    const err = new Error(`Invalid ${label} ID`);
    err.statusCode = 400;
    throw err;
  }
  const doc = await Model.findById(id);
  if (!doc) {
    const err = new Error(`${label} not found`);
    err.statusCode = 404;
    throw err;
  }
  return doc;
}

module.exports = { isValidObjectId, toObjectId, leanFind, findByIdOrFail };
