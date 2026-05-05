'use strict';

/**
 * @module dto/pagination.dto
 *
 * Standardised pagination response envelope.
 */

/**
 * Wrap a data array and pagination meta into the standard response shape.
 * @param {Array} data
 * @param {object} meta - { total, page, limit, totalPages, hasNextPage, hasPrevPage }
 * @returns {object}
 */
function toPaginatedDto(data, meta) {
  return { data, pagination: meta };
}

module.exports = { toPaginatedDto };
