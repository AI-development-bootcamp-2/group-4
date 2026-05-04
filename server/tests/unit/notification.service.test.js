'use strict';

const notificationService = require('../../src/services/notification.service');
const NotificationModule  = require('../../src/models/Notification');

jest.mock('../../src/models/Notification');

// The service imports { Notification } from the module — reference the same shape.
const { Notification } = NotificationModule;

describe('notification.service', () => {
  const userId = 'user-111';

  describe('getNotifications()', () => {
    it('returns paginated notifications for a user', async () => {
      const docs = [{ _id: 'n1', recipient: userId, isRead: false }];
      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(docs),
            }),
          }),
        }),
      });
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
      Notification.unreadCount = jest.fn().mockResolvedValue(5);
      const result = await notificationService.getUnreadCount(userId);
      expect(result).toEqual({ count: 5 });
    });
  });
});
