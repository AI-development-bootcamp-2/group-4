---
# This is a Claude project-level prompt that instructs Claude on how to approach
# security audits of this codebase. Load this file first before reading source code.

You are performing a security audit of a Node.js/Express forum backend.

## Project Summary

The backend uses:
- Express 4.x with JWT authentication (jsonwebtoken)
- MongoDB via Mongoose
- Socket.IO for real-time features
- In-process job queue and LRU cache

## Audit Methodology

When reviewing this codebase, follow this order:

### Step 1 — Read context files first
Start by reading all files in this order to build context before reviewing source code:
1. `.claude/memory/architecture.md`
2. `.claude/memory/security-notes.md`
3. `.claude/memory/project-context.md`
4. `server/docs/ARCHITECTURE.md`
5. `server/docs/NOTIFICATIONS.md`
6. `server/docs/MESSAGES.md`
7. `server/docs/WEBSOCKET.md`
8. `server/docs/SEARCH.md`

### Step 2 — Review all source directories
Systematically review every file in:
- `server/src/adapters/` (3 sub-directories, 7 files)
- `server/src/cache/`
- `server/src/config/`
- `server/src/controllers/`
- `server/src/dto/` (3 sub-directories, 4 files)
- `server/src/events/` (2 sub-directories, 3 files)
- `server/src/guards/` (2 sub-directories, 3 files)
- `server/src/helpers/` (4 sub-directories, 5 files)
- `server/src/interceptors/` (2 sub-directories, 2 files)
- `server/src/lib/`
- `server/src/middleware/`
- `server/src/models/`
- `server/src/plugins/` (2 sub-directories, 3 files)
- `server/src/queue/`
- `server/src/routes/`
- `server/src/schemas/` (2 sub-directories, 3 files)
- `server/src/services/`
- `server/src/socket/`
- `server/src/transformers/`
- `server/src/types/`
- `server/src/utils/`
- `server/src/validators/`

### Step 3 — Review all test files
Check test coverage for each service and route.

### Step 4 — Review all scripts
- `server/scripts/` (5 scripts)

### Step 5 — Review CI configuration
- `.github/workflows/ci.yml`
- `.github/workflows/security.yml`

### Step 6 — Review GitHub configuration
- `.github/CODEOWNERS`
- `.github/pull_request_template.md`

## OWASP Top 10 Checklist

For each file, check:

**A01: Broken Access Control**
- Are ownership checks present on every mutating endpoint?
- Are admin routes protected by role guards?
- Are there IDOR vulnerabilities (accessing resources by id without ownership check)?

**A02: Cryptographic Failures**
- Are passwords hashed with bcrypt/argon2?
- Are JWTs verified (not just decoded)?
- Are secrets loaded from environment variables?

**A03: Injection**
- Are MongoDB queries sanitised? (look for unescaped `$regex`)
- Are there ReDoS vectors in regex patterns?
- Is HTML sanitised before storage/rendering?

**A04: Insecure Design**
- Are rate limits effective?
- Are there DoS vectors (unbounded loops, missing pagination)?

**A05: Security Misconfiguration**
- Are debug endpoints behind environment guards?
- Is error detail suppressed in production?
- Are CORS origins restrictive?

**A07: Identification and Authentication Failures**
- Are refresh tokens properly rotated?
- Are reset tokens single-use and time-limited?
- Are failed login attempts rate-limited?

**A09: Security Logging and Monitoring Failures**
- Are security events (failed logins, privilege escalation) logged?
- Are log entries structured (JSON) and queryable?

## Important Notes

- This codebase has many files. Budget your context window carefully.
- Start with the security-notes.md which documents all known acceptable risks.
- The team has already addressed the common vulnerabilities — focus on edge cases.
- The adapters/ directory contains wrappers for external services that are intentionally 
  not fully implemented (stubs for services not yet provisioned).
- Some files in dto/, schemas/, and helpers/ are dead code kept for API compatibility.
---
