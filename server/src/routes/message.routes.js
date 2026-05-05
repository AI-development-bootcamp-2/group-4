'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const {
  getInbox,
  getMessages,
  sendMessage,
  deleteMessage,
  deleteConversation,
} = require('../controllers/message.controller');

const router = Router();

router.use(authenticate);

router.get('/',                              getInbox);
router.get('/:conversationId',               getMessages);
router.post('/:recipientId',                 sendMessage);
router.delete('/conversations/:conversationId', deleteConversation);
router.delete('/:messageId',                 deleteMessage);

module.exports = router;
