# Windows Explorer Monorepo

## Description

This repo implements a web-based "Windows Explorer" UI. The left panel shows a folder tree; the right panel shows a selected folder’s children. The backend is an Elysia API (TypeScript + Bun). The frontend is Nuxt 3 (Vue 3 + TypeScript). Tests include Vitest unit/integration tests and Cypress end-to-end tests.

## Tech stack

- Backend: Elysia (Bun, TypeScript), PostgreSQL (Prisma), optional Redis cache
- Frontend: Nuxt 3, Vue 3, TypeScript, Tailwind CSS
- Tests: Vitest (unit/integration), Cypress (E2E)

## Repo layout (top-level)

```
backend/   # Elysia API + prisma/
frontend/  # Nuxt 3 app
e2e/       # Cypress tests for the frontend
stack/     # Docker Swarm manifests and helper scripts
```

## Quickstart — local development

Checklist:

- Install Bun (for backend/frontend) or use npm where noted
- Optional: PostgreSQL and Redis if you want to run the full stack

Install dependencies (one command per folder):

1. Backend:

  cd backend
  bun install

2. Frontend:

  cd ../frontend
  bun install

3. E2E (Cypress toolchain):

  cd ../e2e
  npm install

Run services (recommended ports):

- Backend (recommended port to avoid conflict with frontend dev):

  cd backend
  PORT=3001 bun run dev

- Frontend (Nuxt dev — configured for port 3000):

  cd frontend
  BACKEND_URL=http://localhost:3001 bun run dev

Open http://localhost:3000 in your browser.

Notes:

- The frontend defaults `runtimeConfig.public.backendUrl` to `http://localhost:3000` — set `BACKEND_URL` when running the backend on a different port.
- For containerized runs the service hostnames are typically `http://frontend:3000` and `http://backend:3000` (see `stack/`).

## Deployment & Docker Swarm

This repo includes helper scripts and stack manifests in `stack/` for Docker Swarm or `docker compose` deployments. The scripts assume a Linux host and require `sudo` for system-level changes (installing Docker, copying `daemon.json`, restarting the daemon). See `stack/` for details.

Quick run (from repo root):

1. Make scripts executable if needed:

  chmod +x stack/docker-swarm-init.sh stack/auto-deploy.sh

2. Prepare the host and initialize Docker Swarm (requires sudo):

  cd stack && sudo ./docker-swarm-init.sh

3. Deploy stacks / compose files found under `stack/deploy/`:

  ./auto-deploy.sh

If you prefer `docker compose` manually, run it from the `stack/` directory so relative paths resolve correctly.

## Features

- Two-panel file explorer UI (no external tree lib)
- Typed domain, services and repositories
- Prisma + Postgres, optional Redis cache
- Unit/integration tests (Vitest) and E2E tests (Cypress)

## Testing

- Backend (from `backend/`):

  bun run test

- Frontend (from `frontend/`):

  bun run test

- E2E (from `e2e/`): see `e2e/README.md` for container vs local tips