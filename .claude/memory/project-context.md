# Project Context — Group 4 Forum

## What is this?
A full-featured internet forum. Backend: Node.js + Express + MongoDB.

## Team
- Person 1: backend infrastructure, auth, users, notifications, messages, search, admin
- Person 2: posts, comments, likes, categories, tags
- Person 3: React frontend, UI/UX

## Current Status
- Person 1 backend: ✅ complete (feat/person1-backend branch, PR #1)
- Person 2/3: in progress

## Important Files for Context
- `server/src/app.js` — Express app configuration
- `server/src/server.js` — HTTP server entry
- `server/src/routes/index.js` — all routes mounted here
- `server/src/models/User.js` — user schema
- `server/src/middleware/auth.middleware.js` — JWT auth
- `server/src/lib/jwt.js` — token utilities
- `server/src/config/env.js` — environment config

## Environment Variables Required
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/forum
JWT_SECRET=<strong random string>
JWT_REFRESH_SECRET=<different strong random string>
NODE_ENV=development
```

## Running Locally
```bash
cd server
npm install
cp .env.example .env
# edit .env
npm run dev
```

## Testing
```bash
npm test
npm run test:coverage
```

## API Base URL
`http://localhost:5000/api`

## Key Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/users`
- `GET  /api/notifications`
- `GET  /api/messages`
- `GET  /api/search?q=term`
- `GET  /api/admin/stats`
