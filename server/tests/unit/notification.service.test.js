'use strict';

const notificationService = require('../../src/services/notification.service');
const Notification        = require('../../src/models/Notification');

jest.mock('../../src/models/Notification');

describe('notification.service', () => {
  const userId = 'user-111';

  describe('getNotifications()', () => {
    it('returns paginated notifications for a user', async () => {
      const docs = [{ _id: 'n1', recipient: userId, isRead: false }];
      Notification.find   = jest.fn().mockReturnValue({ sort: () => ({ skip: () => ({ limit: () => ({ lean: () => Promise.resolve(docs) }) }) }) });
      Notification.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await notificationService.getNotifications(userId, { page: 1, limit: 10 });
      expect(result.notifications).toHaveLength(1);
    });
  });

  describe('markAllRead()', () => {
    it('calls Notification.markAllRead with userId', async () => {
      Notification.markAllRead = jest.fn().mockResolvedValue({ modifiedCount: 3 });
      await notificationService.markAllRead(userId);
      expect(Notification.markAllRead).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUnreadCount()', () => {
    it('returns numeric count', async () => {
      Notification.countDocuments = jest.fn().mockResolvedValue(5);
      const count = await notificationService.getUnreadCount(userId);
      expect(typeof count).toBe('number');
    });
  });
});
