# Security Review Notes — Group 4 Forum Backend

Last updated: 2026-05-04
Reviewed by: Team

## Authentication & Authorization

### JWT Implementation
- Access tokens signed with `JWT_SECRET` (HS256)
- Refresh tokens signed with `JWT_REFRESH_SECRET`
- Token verification in `src/lib/jwt.js` → `verifyToken()`
- Auth middleware: `src/middleware/auth.middleware.js`
- Role guard: `requireRole(...roles)` — checks `req.user.role`

### Known Acceptable Risks
- `x-debug-user` impersonation header — **dev/staging only**, disabled in production
  via `config.nodeEnv !== 'production'` check in `src/plugins/debug.plugin.js`
- Token passed as `?token=` query param — **WebSocket upgrade only**, documented in auth middleware

## Input Validation
- All endpoints use `express-validator` chains (see `src/validators/`)
- Request bodies mapped through DTOs before reaching models
- `sanitizeHtml()` applied to post/comment content server-side
- `escapeRegex()` available in `src/utils/sanitize.js` — used by query builder

## Password Security
- bcrypt with configurable rounds (see `User.js` pre-save hook)
- Reset tokens generated via `src/lib/crypto.js`
- Passwords never returned in API responses (checked by `user.transformer.js`)

## File Upload
- Multer disk storage in `public/uploads/`
- File type + MIME validation in `src/validators/file.validator.js`
- Max size enforced at middleware level

## Rate Limiting
- `src/middleware/rateLimiter.middleware.js` — sliding window per IP
- Auth endpoints use stricter limits (configured in routes)

## CORS
- `src/config/cors.js` — origins configured via environment variable
- Credentials mode enabled for cookie-based refresh tokens

## Error Handling
- Stack traces in error responses — **disable in production** by setting `NODE_ENV=production`
- Error codes normalised in `src/constants/errors.js`

## Dependencies
- All production dependencies audited — run `npm audit` before release
- No `eval()` usage in business logic
- No `child_process` in request handlers

## Open Items
- [ ] Redis-backed rate limiting for multi-instance deployments
- [ ] Helmet.js for comprehensive security headers (currently manual)
- [ ] CSRF protection for cookie sessions
- [ ] Content Security Policy header
