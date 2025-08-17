# Windows Explorer Monorepo

## Description

This project is a web-based "Windows Explorer" application. The left panel shows a tree of folders; the right panel shows the selected folder’s direct children. The backend uses Elysia with a clean service/repository layout; the frontend is a Nuxt 3 app. Tests cover units/integration (Vitest) and end-to-end (Cypress).

## Technologies

### Backend
- Framework: Elysia (Bun, TypeScript)
- Database: PostgreSQL (via Prisma)
- Cache: Redis

### Frontend
- Framework: Nuxt 3 (Vue 3, TypeScript)
- UI: Tailwind CSS and Nuxt UI

### Testing
- Unit/Integration: Vitest
- E2E: Cypress

## Repository layout

```
/
├── backend/                  # Elysia API
│   ├── prisma/               # Prisma schema
│   └── src/
│       ├── application/      # Services + ports
│       ├── domain/           # Entities
│       ├── infra/            # DB/Redis/adapters
│       ├── interfaces/       # HTTP routes
│       └── index.ts          # App entry (default PORT=3000)
├── frontend/                 # Nuxt 3 app
│   ├── components/
│   │   └── explorer/         # Tree UI (Tree.vue, TreeItem.vue, RightPanel.vue)
│   ├── pages/                # index.vue
│   ├── composables/          # state, data, search
│   └── nuxt.config.ts        # runtimeConfig.public.backendUrl
├── e2e/                      # Cypress tests for the frontend
├── stack/                    # Docker Swarm manifests and helpers
└── README.md
```

## Getting started (local development)

Prerequisites:
- Bun installed
- Optional: PostgreSQL and Redis (see stack/ or use your own instances)

Install dependencies (run per app):
- Backend: `cd backend && bun install`
- Frontend: `cd frontend && bun install`
- E2E: `cd e2e && npm i`

Run backend (choose a port that doesn’t conflict with Nuxt dev):
- Default backend port is 3000 (see `backend/src/config/env.ts`).
- Recommended locally: run backend on 3001.
  - Example: `PORT=3001 bun run dev` (from `backend/`).

Run frontend and point it to your backend:
- Frontend dev runs on 3000 by default.
- Set `BACKEND_URL` so the app knows where to fetch API data.
  - Example: `BACKEND_URL=http://localhost:3001 bun run dev` (from `frontend/`).

Now open http://localhost:3000.

Notes:
- The frontend defaults `runtimeConfig.public.backendUrl` to `http://localhost:3000`. Override it when running the backend on a different port.
- For containerized/dev-cluster runs, services often resolve as `http://frontend:3000` and `http://backend:3000` (see stack/).

## Deployment & Docker Swarm

This repository includes helper scripts and stack manifests for deploying the full system to a Docker Swarm or using Docker Compose. The two main helper scripts live in the `stack/` folder:

- `stack/docker-swarm-init.sh` — prepares the host for Docker and Swarm usage. Key behaviors:
  - Installs Docker (on Debian/Ubuntu) if the `docker` CLI is not present (uses `sudo`).
  - If a `stack/daemon.json` exists in the repository, it will copy it to `/etc/docker/daemon.json` (requires `sudo`) when different or missing.
  - Restarts the Docker daemon and waits for it to become available.
  - Initializes a Docker Swarm (runs `docker swarm init --advertise-addr 127.0.0.1`).
  - Creates two networks used by the stack manifests:
    - `docker_gwbridge` with subnet `10.174.0.0/24` and a custom bridge name (used for routing).
    - `base-net` an attachable overlay network (IPv6 enabled) for swarm services.

- `stack/auto-deploy.sh` — discovers YAML/stack files in `stack/deploy/` and deploys them sequentially. Key behaviors:
  - Changes working directory to `stack/` so relative paths in compose files resolve correctly.
  - Exports `COMPOSE_PROJECT_DIR` so docker-compose resolves relative paths from the `stack` folder.
  - Finds files in `stack/deploy/` in this order: `*.stack.yml`, `*.yml`, `*.yaml` (sorted by name) and deploys each file.
  - Prefers `docker stack deploy --with-registry-auth -c <file> <stack_name>` when the Docker CLI supports `stack` (stack name inferred from filename).
  - Falls back to `docker compose -f <file> up -d` when `docker stack` is not available.

Usage notes and prerequisites:

- Both scripts assume a Linux host (the scripts use `apt` and `systemctl` where appropriate). `sudo` is required for system-level changes (installing Docker, copying `daemon.json`, restarting the daemon).
- `stack/docker-swarm-init.sh` is idempotent for many operations (it will skip installing Docker if present and only copy `daemon.json` when it differs).
- `stack/auto-deploy.sh` will fail early if no files exist in `stack/deploy/` or if the `docker` CLI is not available.

Quick run commands (from repository root):

```bash
# Make scripts executable if needed
chmod +x stack/docker-swarm-init.sh stack/auto-deploy.sh

# Prepare the host and initialize Docker Swarm (requires sudo for installs/copies)
cd stack && sudo ./docker-swarm-init.sh

# Deploy stacks / compose files found under stack/deploy/
./auto-deploy.sh
```

If you prefer to use `docker compose` manually rather than the stack deploy flow, run `docker compose -f stack/deploy/<file> up -d` from the `stack/` directory so relative paths in the compose files (for volumes and `./config/traefik`) resolve correctly.

Security & operational notes:

- The `docker-swarm-init` script copies `stack/daemon.json` to `/etc/docker/daemon.json` when present. Review that file before running to ensure your daemon config is appropriate for the host.
- The scripts are best run on a single machine intended to act as a Swarm manager. The `docker swarm init` call advertises `127.0.0.1` by default; you may want to customize the advertise address for multi-host clusters.

## Features

- Two-panel file explorer UI (no external tree lib)
- Typed domain + services + repositories
- Prisma + Postgres, optional Redis cache
- Unit/integration tests (Vitest) and E2E tests (Cypress)

## Testing

Backend (from `backend/`):
- `bun run test`

Frontend (from `frontend/`):
- `bun run test`

E2E (from `e2e/`): see `e2e/README.md` for container vs local tips