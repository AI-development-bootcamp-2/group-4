# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Reverse CTF bootcamp project** — a full-stack internet forum where the team intentionally plants bugs for another group to find during Code Review. Every feature ships as a separate PR that must pass CI before merging.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB (no Mongoose or minimal Mongoose) |
| Auth | JWT or Sessions — chosen by the team |

## Commands

Once the project is scaffolded, the expected commands are:

```bash
# Root
npm install          # install all dependencies
npm run dev          # start both client and server (if concurrently is set up)

# Server (from server/)
npm run dev          # nodemon index.js
npm run lint         # eslint
npm test             # jest

# Client (from client/)
npm run dev          # vite dev server (default: http://localhost:5173)
npm run build        # production build
npm run lint         # eslint
npm test             # vitest
```

CI runs build + lint + tests on every PR via `.github/workflows/ci.yml`.

## Architecture

The repo is a monorepo with two independent packages:

```
forum-project/
├── client/       # React SPA (Vite)
├── server/       # Express REST API
└── .github/workflows/ci.yml
```

### Backend (`server/`)

- `index.js` — entry point, mounts all routers
- `routes/` — one file per resource (`auth.js`, `users.js`, `posts.js`, `comments.js`, etc.)
- `controllers/` — business logic called by routes
- `middleware/` — auth guard (verifies JWT/session), error handler
- `config/` — MongoDB connection, env vars

The API base is `/api`. All protected routes require the auth middleware.

### Frontend (`client/src/`)

- `services/api.js` — single Axios instance pointed at `http://localhost:5000/api`; attaches the auth token from `localStorage` via an interceptor. All API calls go through here.
- `context/AuthContext.jsx` — current user state, login/logout helpers
- `context/ThemeContext.jsx` — dark/light mode toggle, persisted in `localStorage`
- `pages/` — one file per route (see route table below)
- `components/` — shared UI pieces used across pages

**Client-side routes:**

| Path | Page |
|------|------|
| `/` | HomePage (feed) |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/profile/:id` | ProfilePage |
| `/posts/:id` | PostPage |
| `/posts/new` | CreatePostPage |
| `/posts/:id/edit` | EditPostPage |
| `/messages` | InboxPage |
| `/search` | SearchPage |
| `/admin` | AdminDashboardPage |
| `*` | NotFoundPage |

### MongoDB Models

```js
User    { _id, username, email, password/*hashed*/, avatar, bio, role, createdAt, updatedAt }
Post    { _id, title, content, author/*User*/, category, tags, likes/*User[]*/, createdAt, updatedAt }
Comment { _id, content, author/*User*/, post/*Post*/, parent/*Comment — nested*/, likes/*User[]*/, createdAt, updatedAt }
```

## Task Ownership

| Person | Owns |
|--------|------|
| Person 1 | server/ setup, CI, auth endpoints, user endpoints |
| Person 2 | posts, comments, interactions, categories & tags |
| Person 3 | all of client/, notifications, private messages, admin panel, search UI |

Person 3's detailed spec lives in `spec/SPEC.md`.

## Game Rules

- Every feature = **one PR** (CI must pass, other group approves, then merge)
- Bugs are planted intentionally and tracked in a **local secret file** — never commit it
- Scoring: 2 pts per bug planted that survives review, 2 pts per bug caught in the other group's code, 1 pt creativity bonus
