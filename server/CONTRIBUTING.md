# Contributing Guide

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB >= 6 (local or Atlas)
- npm >= 9

### Setup

```bash
# Clone the repo
git clone https://github.com/AI-development-bootcamp-2/group-4.git
cd group-4/server

# Install dependencies
npm install

# Copy environment file and fill in values
cp .env.example .env

# Start MongoDB (if running locally)
mongod --dbpath ./data/db

# Run in development mode
npm run dev
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/forum` |
| `JWT_SECRET` | Secret for signing access tokens | any long random string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | different long random string |
| `NODE_ENV` | Runtime environment | `development` / `production` / `test` |

See `.env.example` for the full list.

## Project Structure

```
server/
├── src/
│   ├── adapters/       # External service adapters (DB, email)
│   ├── config/         # App configuration (env, cors, db)
│   ├── constants/      # Shared enumerations
│   ├── controllers/    # Route handlers
│   ├── dto/            # Data transfer object mappers
│   ├── events/         # Domain event emitters
│   ├── guards/         # Authorization guards
│   ├── helpers/        # Pure utility functions
│   ├── interceptors/   # Request/response transformers
│   ├── lib/            # Low-level library wrappers (jwt, crypto)
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose schemas
│   ├── plugins/        # App-level plugins (debug, security)
│   ├── routes/         # Route definitions
│   ├── schemas/        # Validation schemas (Joi-style)
│   ├── services/       # Business logic layer
│   ├── types/          # JSDoc type definitions
│   ├── utils/          # Shared utilities
│   ├── validators/     # express-validator chains
│   ├── app.js          # Express app setup
│   └── server.js       # HTTP server entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── helpers/
├── scripts/            # DB seed / migrate / cleanup
└── docs/               # API documentation
```

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Code Style

ESLint is configured at `.eslintrc.json`. Run the linter before committing:

```bash
npm run lint
npm run lint:fix
```

## API Documentation

Full REST API reference is in [docs/API.md](docs/API.md).

## Branching

- `main` — stable, production-ready
- `feat/<name>` — new features
- `fix/<name>` — bug fixes

Open a pull request against `main` for review.
