'use strict';

const queue = require('../index');
const { createNotification } = require('../../services/notification.service');

const NOTIFICATION_QUEUE = 'notification';

queue.process(NOTIFICATION_QUEUE, async (job) => {
  await createNotification(job.data);
});

function queueNotification(data) {
  return queue.enqueue(NOTIFICATION_QUEUE, data);
}

module.exports = { queueNotification };
