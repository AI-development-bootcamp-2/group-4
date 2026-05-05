'use strict';

const queue = require('../index');
const { sendWelcome, sendPasswordReset } = require('../../adapters/email.adapter');

const EMAIL_QUEUE = 'email';

// Register the processor
queue.process(EMAIL_QUEUE, async (job) => {
  const { type, to, data } = job.data;
  if (type === 'welcome')        await sendWelcome(to, data.username);
  if (type === 'passwordReset')  await sendPasswordReset(to, data.resetUrl);
});

function queueWelcomeEmail(to, username) {
  return queue.enqueue(EMAIL_QUEUE, { type: 'welcome', to, data: { username } });
}

function queuePasswordResetEmail(to, resetUrl) {
  return queue.enqueue(EMAIL_QUEUE, { type: 'passwordReset', to, data: { resetUrl } });
}

module.exports = { queueWelcomeEmail, queuePasswordResetEmail };
