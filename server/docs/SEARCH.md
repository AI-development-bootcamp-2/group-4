# Search

## Overview

Global search across users, posts, and comments via a single endpoint.

## API

```
GET /api/search?q=term&type=all&category=x&author=userId&from=ISO&to=ISO&limit=10
```

### Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | — | Search term (required) |
| `type` | string | `all` | `all` \| `users` \| `posts` \| `comments` |
| `category` | string | — | Filter posts by category |
| `author` | ObjectId | — | Filter posts by author |
| `from` | ISO date | — | Created after |
| `to` | ISO date | — | Created before |
| `limit` | number | 10 | Results per collection |

### Response

```json
{
  "success": true,
  "data": {
    "users":    [...],
    "posts":    [...],
    "comments": [...],
    "total":    42,
    "term":     "search query"
  }
}
```

## Implementation

- `src/lib/searchEngine.js` — low-level MongoDB `$regex` queries across collections
- `src/services/search.service.js` — orchestrates collections, applies filters
- `src/controllers/search.controller.js` — thin HTTP layer

## Authentication

Search is public (no auth required). Authenticated requests may receive personalised results in future.

## Performance Notes

- MongoDB `$regex` is used for MVP — add text indexes before production launch
- Each collection is queried in parallel via `Promise.all`
- Results are not paginated at the collection level — use `limit` param
