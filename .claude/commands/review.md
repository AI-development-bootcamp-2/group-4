# Code Review Checklist

Use this when reviewing Person 2 and Person 3 PRs.

## General
- [ ] No hardcoded secrets or API keys
- [ ] All async handlers wrapped in asyncHandler
- [ ] No raw `res.json()` outside of middleware — use `sendSuccess`/`sendError`
- [ ] No `console.log` in production paths — use the logger utility
- [ ] Error objects have `statusCode` for proper HTTP response

## Authentication & Authorization
- [ ] Protected routes use `authenticate` middleware
- [ ] Write endpoints check ownership (use `ownershipGuard` or manual check)
- [ ] No auth bypass paths

## Validation
- [ ] All body inputs have express-validator chains
- [ ] Validator chains include `validate` middleware at end of array
- [ ] ObjectId params validated with `validateId` from `src/validators/id.validator.js`

## Database
- [ ] No `.select()` missing on user queries — password must be excluded
- [ ] Use `lean()` for read-only queries
- [ ] Indexes exist for all filtered/sorted fields

## Pagination
- [ ] List endpoints use `parsePagination(req.query)` from `src/utils/paginate.js`
- [ ] Response includes `pagination` meta from `buildPaginationMeta()`

## File Upload
- [ ] Uses `uploadMiddleware` from `src/middleware/upload.middleware.js`
- [ ] File size and type limits enforced

## Tests
- [ ] Unit tests for service functions
- [ ] Integration tests for route handlers
- [ ] Auth flows tested (authed, unauthed, wrong role)

## Documentation
- [ ] New endpoints documented in `server/docs/API.md`
- [ ] JSDoc on exported functions
