# WebSocket / Real-time

## Setup

Socket.IO server is attached to the same HTTP server as Express.
Created in `src/socket/index.js`, mounted in `src/server.js`.

## Authentication

Clients send JWT in the Socket.IO handshake:

```js
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});
```

Server verifies via the same `verifyToken()` used by REST middleware.

## Rooms

| Room | Members | Events |
|------|---------|--------|
| `user:<userId>` | Single user | Notifications, incoming messages |
| `conversation:<id>` | Both participants | Message delivery, typing |
| `post:<postId>` | Anyone viewing the post | Live comment updates (future) |
| `presence` | All authenticated | Online/offline status |

## Client Events (emit)

| Event | Payload | Description |
|-------|---------|-------------|
| `notifications:subscribe` | — | Request current unread count |
| `notifications:markRead` | `{ notificationId }` | Mark one notification read |
| `messages:joinConversation` | `{ conversationId }` | Join conversation room |
| `messages:leaveConversation` | `{ conversationId }` | Leave conversation room |
| `messages:typing` | `{ conversationId }` | Start typing indicator |
| `messages:stopTyping` | `{ conversationId }` | Stop typing indicator |
| `presence:away` | — | Set status to away |

## Server Events (listen)

| Event | Payload | Description |
|-------|---------|-------------|
| `notifications:count` | `{ count }` | Current unread count |
| `notifications:new` | Notification object | New notification arrived |
| `messages:new` | Message object | New message in conversation |
| `messages:typing` | `{ userId, conversationId }` | Someone is typing |
| `messages:stopTyping` | `{ userId, conversationId }` | Stopped typing |
| `presence:online` | `{ userId }` | User came online |
| `presence:offline` | `{ userId }` | User went offline |
| `presence:away` | `{ userId }` | User is away |
