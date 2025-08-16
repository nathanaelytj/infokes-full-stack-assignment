# Windows Explorer Backend

Backend API for the Windows Explorer app. Built with Elysia (Bun), Prisma (PostgreSQL), optional Redis caching, and Vitest. Follows a clean architecture with clear separation between HTTP, application, domain, and infra layers.

## Tech

- Framework: Elysia
- Runtime: Bun
- Language: TypeScript
- Database: PostgreSQL + Prisma
- Cache: Redis (optional)
- Testing: Vitest

## Architecture & Structure

Key layers and where they live in this repo:

- interfaces/http: Elysia routes (HTTP layer)
- application: business services and ports (use cases)
- domain: entities and types
- infra: Prisma/Redis adapters (DB, cache, repositories)

Project layout (trimmed):

```
backend/
├─ src/
│  ├─ index.ts                      # Create and start Elysia app
│  ├─ config/env.ts                 # Env parsing (PORT, DATABASE_URL, REDIS_URL)
│  ├─ interfaces/http/routes.ts     # /api/v1 routes
│  ├─ application/
│  │  ├─ ports/item-repository.ts
│  │  └─ services/item-service.ts
│  ├─ domain/item.ts
│  └─ infra/
│     ├─ db/prisma.ts
│     ├─ cache/redis.ts
│     └─ repositories/prisma-item-repo.ts
└─ prisma/schema.prisma
```

## Getting Started

### Prereqs

- Bun runtime
- PostgreSQL reachable via DATABASE_URL
- Redis optional (set REDIS_URL to enable cache)

### 1) Configure env

From `backend/`, copy and edit `.env`:

```
cp .env.example .env
```

`.env` keys:

- DATABASE_URL=postgresql://user:pass@host:5432/db
- REDIS_URL=redis://localhost:6379 (optional)
- PORT=3000 (recommend 3001 if running Nuxt dev on 3000)

### 2) Install deps

```
bun install
```

### 3) Init database

```
bun run prisma:generate
bun run prisma:push
```

Optional seed: see `stack/seeder.sql` (load with your preferred tool).

### 4) Run

```
bun dev
```

Server listens on `PORT` (default 3000). If you also run the Nuxt frontend (default 3000), set backend `PORT=3001` and point the frontend to it.

## API

Base URL: `/api/v1`

- GET /health → { status: "ok" }
- GET /items → full tree (flat list ordered, client can build tree)
- GET /items/:id → one item or 404
- GET /items/children?parentId=<uuid|null> → direct children
- GET /items/search?q=...&parentId=...&type=folder|file&limit=1..100&cursor=<uuid> → paginated search
- POST /items { name, parentId|null, type: "folder"|"file" }
- PATCH /items/:id { name?, parentId? }
- DELETE /items/:id → 204

Notes

- CORS is enabled for localhost and its subdomains by default (see `src/index.ts`).
- Redis is optional; without `REDIS_URL`, caching is bypassed.

## Testing

```
bun run test            # unit tests (Vitest)
bun run test:watch
bun run test:coverage
```

## Production

Docker Swarm manifests live under `stack/deploy/`. For local dev, use your own Postgres/Redis containers or services; a docker-compose file is not included here.
