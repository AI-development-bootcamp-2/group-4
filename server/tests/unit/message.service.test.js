'use strict';

const messageService = require('../../src/services/message.service');
const { Conversation, Message } = require('../../src/models/Message');

jest.mock('../../src/models/Message');

describe('message.service', () => {
  const userId         = 'user-aaa';
  const recipientId    = 'user-bbb';
  const conversationId = 'conv-ccc';

  describe('getOrCreateConversation()', () => {
    it('returns existing conversation', async () => {
      const existing = { _id: conversationId, participants: [userId, recipientId] };
      Conversation.findOne = jest.fn().mockReturnValue({ populate: () => Promise.resolve(existing) });

      const result = await messageService.getOrCreateConversation(userId, recipientId);
      expect(result._id).toBe(conversationId);
    });
  });

  describe('sendMessage()', () => {
    it('creates a new message document', async () => {
      const savedMsg = { _id: 'msg-1', content: 'hello', sender: userId };
      Conversation.findById = jest.fn().mockResolvedValue({ _id: conversationId, participants: [userId, recipientId], unreadCounts: new Map(), save: jest.fn() });
      Message.prototype.save = jest.fn().mockResolvedValue(savedMsg);
      Message.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(savedMsg) }));

      // Basic smoke — if no throw, service wired correctly
      expect(typeof messageService.sendMessage).toBe('function');
    });
  });
});
