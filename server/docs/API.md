# API Reference

Base URL: `http://localhost:3000/api`

---

## Auth

### POST /auth/register
Create a new account.

**Body:**
```json
{ "username": "string", "email": "string", "password": "string" }
```

**Response 201:**
```json
{ "success": true, "data": { "user": {...}, "token": "...", "refreshToken": "..." } }
```

---

### POST /auth/login
**Body:**
```json
{ "identifier": "email or username", "password": "string" }
```

**Response 200:**
```json
{ "success": true, "data": { "user": {...}, "token": "...", "refreshToken": "..." } }
```

---

### POST /auth/logout
Requires `Authorization: Bearer <token>`

---

### POST /auth/forgot-password
**Body:** `{ "email": "string" }`

---

### POST /auth/reset-password
**Body:** `{ "token": "string", "newPassword": "string" }`

---

## Users

### GET /users
Query params: `page`, `limit`, `search`

### GET /users/:id
Public profile.

### PUT /users/:id
Requires auth. Update `username`, `bio`, `avatar`.

### DELETE /users/:id
Requires auth.

### PUT /users/:id/avatar
Requires auth. Multipart form with `avatar` field.

### PUT /users/:id/password
Requires auth. Body: `{ "newPassword": "string" }`

### POST /users/:id/follow
Requires auth.

### POST /users/:id/unfollow
Requires auth.

### POST /users/:id/block
Requires auth.

### POST /users/:id/unblock
Requires auth.

### PUT /users/:id/status
Requires auth. Body: `{ "status": "online"|"offline"|"away" }`
