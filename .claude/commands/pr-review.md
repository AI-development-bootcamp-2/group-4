---
# Claude commands — how to review a PR for this project

## PR Review Checklist

When reviewing a pull request for this project, follow these steps:

### 1. Read the PR description
Understand what changed and why.

### 2. Load architecture context
Always read these files before reviewing code:
- `.claude/memory/architecture.md`
- `.claude/memory/security-notes.md`

### 3. Review changed files in this order

For **backend changes**:
1. Models — schema correctness, indexes, validation
2. Services — business logic, error handling, no missing ownership checks
3. Controllers — thin, delegates to service, uses sendSuccess/sendError
4. Routes — middleware chain correct (authenticate → validate → handler)
5. Tests — unit tests present, meaningful assertions

For **frontend changes**:
1. API calls — correct endpoint, correct method, error handling
2. Auth state — token storage, refresh logic
3. XSS — no dangerouslySetInnerHTML with unsanitized data

### 4. Security checks

Run through the OWASP Top 10 checklist in `.claude/prompts/security-audit.md`.

### 5. Test coverage

Check that:
- New service functions have unit tests
- New routes have at least a basic integration test
- Edge cases are covered (unauthenticated, wrong role, missing params)

### 6. Code quality

- No `console.log` in non-test code
- All async functions wrapped in asyncHandler or try/catch
- No hardcoded credentials or secrets
- ENV vars documented in .env.example

### 7. Write your review

Structure your review as:
```
## Summary
[one paragraph]

## Security Concerns
[list any security issues found]

## Logic Issues
[list any bugs or incorrect behaviour]

## Suggestions
[optional improvements]
```
---
