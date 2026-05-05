'use strict';

/**
 * @module queue/index
 *
 * Simple in-memory job queue for async background tasks.
 * Replace with Bull/BullMQ + Redis for production.
 */

const logger = require('../utils/logger');

const queues = new Map();

function getQueue(name) {
  if (!queues.has(name)) queues.set(name, []);
  return queues.get(name);
}

/**
 * Enqueue a job.
 * @param {string} queueName
 * @param {object} data
 * @param {object} [options]
 * @param {number} [options.delay]  - delay in ms before processing
 */
function enqueue(queueName, data, options = {}) {
  const queue = getQueue(queueName);
  const job = { id: Date.now() + Math.random(), data, options, enqueuedAt: new Date() };
  queue.push(job);
  logger.debug(`[Queue] Enqueued job to "${queueName}": ${JSON.stringify(data).substring(0, 80)}`);
  // Process immediately (in-process, no worker thread)
  setImmediate(() => processNext(queueName));
  return job;
}

const processors = new Map();

/**
 * Register a processor for a queue.
 * @param {string}   queueName
 * @param {Function} processorFn  - async (job) => void
 */
function process(queueName, processorFn) {
  processors.set(queueName, processorFn);
}

async function processNext(queueName) {
  const queue = getQueue(queueName);
  if (!queue.length) return;
  const job = queue.shift();
  const fn  = processors.get(queueName);
  if (!fn) return;
  try {
    await fn(job);
  } catch (err) {
    logger.warn(`[Queue] Job failed in "${queueName}": ${err.message}`);
  }
}

module.exports = { enqueue, process, getQueue };
