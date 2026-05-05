# Project Architecture — Group 4 Forum

## Overview

This is a full-stack internet forum built with React (client) and Node.js/Express (server).
The backend follows a layered architecture pattern with strict separation of concerns.

## Layer Diagram

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  Express Router (src/routes/)                        │
│  Middleware chain: rateLimiter → auth → validate     │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Controllers (src/controllers/)                      │
│  Thin layer — parse req, call service, send res      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Services (src/services/)                            │
│  Business logic, orchestration, transaction mgmt     │
└──────┬────────────────────────────┬─────────────────┘
       │                            │
       ▼                            ▼
┌────────────┐              ┌───────────────┐
│  Models    │              │  External      │
│ (Mongoose) │              │  (email, S3)   │
└────────────┘              └───────────────┘
```

## Key Design Decisions

### Authentication
- JWT Bearer tokens for stateless auth
- Access tokens + refresh tokens (separate secrets)
- Token verification via `src/lib/jwt.js` which wraps jsonwebtoken
- Auth middleware extracts + verifies token, attaches `req.user`

### Pagination
- All list endpoints use cursor-based offset pagination
- `parsePagination(req.query)` → `{ page, limit, skip }`
- `buildPaginationMeta(total, page, limit)` builds response meta
- Default page size: 20 (configurable per endpoint via PAGINATION_DEFAULTS)

### Error Handling
- All async route handlers wrapped in `asyncHandler`
- Operational errors propagate to `error.middleware.js` via `next(err)`
- Error middleware serializes + returns JSON error envelope
- Stack traces included in response for debugging (configurable)

### Validation
- `express-validator` chains defined in `src/validators/`
- `validate` middleware terminates request on failure (422)
- DTOs in `src/dto/` map request body to safe input objects

### File Upload
- `multer` with disk storage to `public/uploads/`
- File type validation via `src/validators/file.validator.js`
- Avatar upload: `POST /api/users/:id/avatar`

### Real-time
- Socket.IO server created in `src/socket/index.js`
- Auth via JWT in handshake (same token as REST)
- Personal rooms: `user:<userId>`
- Presence tracking updates `User.onlineStatus`

### Background Jobs
- In-process queue (`src/queue/`) for email + notifications
- Replace with Bull + Redis for production scale

### Caching
- In-process LRU cache (`src/cache/`) for hot reads
- `CacheKeys` module centralises key naming
- Invalidate on write via `cache.del(CacheKeys.user(id))`

## Directory Reference

| Path | Purpose |
|------|---------|
| `src/adapters/` | External service wrappers (email, mongoose helpers) |
| `src/cache/` | In-process cache (LRU + TTL) |
| `src/config/` | Environment config, CORS, DB connection |
| `src/constants/` | Enumerations (roles, HTTP status, error codes) |
| `src/controllers/` | Route handlers — thin, delegate to services |
| `src/dto/` | Request body mappers and whitelist filters |
| `src/events/` | EventEmitter domain events |
| `src/guards/` | Authorization checks (ownership, role) |
| `src/helpers/` | Pure utility functions (string, date, array, crypto) |
| `src/interceptors/` | Request/response transformation middleware |
| `src/lib/` | Low-level wrappers (jwt, crypto, pagination, queryBuilder, errors) |
| `src/middleware/` | Express middleware (auth, error, validate, upload, rateLimit, log) |
| `src/models/` | Mongoose schemas and models |
| `src/plugins/` | App-level plugins (security headers, debug tooling) |
| `src/queue/` | Background job queue |
| `src/routes/` | Express routers — mount controllers, apply middleware chains |
| `src/schemas/` | Joi-style validation schemas (used by validators) |
| `src/services/` | Business logic layer |
| `src/socket/` | Socket.IO server, room management, event handlers |
| `src/transformers/` | Response shape normalizers |
| `src/types/` | JSDoc type definitions |
| `src/utils/` | Shared utilities (asyncHandler, logger, paginate, response, sanitize, token) |
| `src/validators/` | express-validator chains |
| `tests/` | Jest test suites (unit, integration, e2e) |
| `scripts/` | DB seed, migrate, cleanup |
| `docs/` | API documentation |
