# Private Messages

## Overview

Direct messaging between two users. Conversations group messages between a participant pair.

## Data Model

### Conversation
```js
{
  participants: [ObjectId, ObjectId],
  lastMessage: { content, sender, sentAt },
  unreadCounts: Map<userId, count>,
  deletedBy: [ObjectId]
}
```

### Message
```js
{
  conversation: ObjectId,
  sender: ObjectId,
  content: String,
  isRead: Boolean,
  readAt: Date,
  deletedBy: [ObjectId],
  replyTo: ObjectId,
  attachments: [{ url, filename, mimeType, size }]
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages` | Inbox (all conversations) |
| GET | `/api/messages/:conversationId` | Messages in a conversation |
| POST | `/api/messages/:recipientId` | Send a message |
| DELETE | `/api/messages/:messageId` | Delete a message (soft) |
| DELETE | `/api/messages/conversations/:conversationId` | Delete conversation |

## Soft Delete Behaviour

- Deleting a message adds the user's id to `message.deletedBy`
- The message is hidden from that user's view
- When all conversation participants have deleted, the message is hard-deleted
- Deleting a conversation hides it from the user's inbox; the other participant still sees it

## Real-time

When a new message is sent:
1. REST response returns the saved message
2. Socket.IO emits `messages:new` to the `conversation:<id>` room
3. Recipient (if online) receives the message without polling

## Unread Counts

- `conversation.unreadCounts` is a Map keyed by userId
- Incremented when a message is sent
- Reset to 0 when `getMessages()` is called (reads mark messages as read)
