# Notification System

## Overview

The notification system delivers real-time and persistent in-app alerts to users.

## Architecture

```
Action (e.g. new comment)
       │
       ▼
Service layer calls createNotification()
       │
       ▼
Notification.createSafe() → MongoDB
       │
       ├──→ Socket.IO emit to user:<userId> room (real-time)
       └──→ Queue job for push notification (future)
```

## Notification Types

| Type | Trigger |
|------|---------|
| `comment` | Someone commented on your post |
| `like_post` | Someone liked your post |
| `like_comment` | Someone liked your comment |
| `follow` | Someone followed you |
| `mention` | Someone @mentioned you |
| `reply` | Someone replied to your comment |
| `system` | System-generated alert |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Required | Paginated notification list |
| GET | `/api/notifications/unread-count` | Required | Unread count |
| PATCH | `/api/notifications/:id/read` | Required | Mark one as read |
| PATCH | `/api/notifications/read-all` | Required | Mark all as read |
| DELETE | `/api/notifications/:id` | Required | Delete one |
| DELETE | `/api/notifications` | Required | Clear all |

## Query Parameters (GET /api/notifications)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `unreadOnly` | boolean | false | Filter unread only |

## TTL

Notifications are automatically deleted after 90 days via a MongoDB TTL index on `createdAt`.

## Creating Notifications (internal)

```js
const { createNotification, NOTIFICATION_TYPES } = require('../services/notification.service');

await createNotification({
  recipient: targetUserId,
  actor:     currentUserId,
  type:      NOTIFICATION_TYPES.COMMENT,
  resourceId:   postId,
  resourceType: 'Post',
  message:   `${actor.username} commented on your post`,
});
```

`createNotification` is safe — it swallows errors internally and never throws.
