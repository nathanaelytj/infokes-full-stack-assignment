# Windows Explorer Monorepo

## Description

This project is a web-based "Windows Explorer" application, built as a monorepo to separate the frontend and backend concerns. The application is split into two main panels: a left panel that displays a complete, tree-like folder structure, and a right panel that shows the direct subfolders and files of the currently selected folder.

The application is built to be scalable and uses modern best practices, including a service and repository layer, caching, and a comprehensive testing suite.

## Technologies

### Backend

  * **Framework:** [Elysia](https://elysiajs.com/)
  * **Runtime:** [Bun](https://bun.sh/)
  * **Language:** [TypeScript](https://www.typescriptlang.org/)
  * **Database:** [PostgreSQL](https://www.postgresql.org/)
  * **Caching:** [Redis](https://redis.io/)

### Frontend

  * **Framework:** [Nuxt 3](https://nuxt.com/)
  * **UI Library:** [Tailwind CSS](https://tailwindcss.com/)
  * **Language:** [TypeScript](https://www.typescriptlang.org/)

### Testing

  * **Unit/Integration:** [Vitest](https://vitest.dev/)
  * **E2E:** [Cypress](https://www.cypress.io/)

### Monorepo Tooling

  * **Package Manager:** [Bun](https://bun.sh/)

## Project Structure

The project is structured as a monorepo with two main applications: `frontend` and `backend`.

```
/
├── backend/                  # Elysia API for serving data
│   ├── src/
│   │   ├── services/         # Business logic layer
│   │   ├── repositories/     # Data access layer
│   │   └── index.ts          # Main Elysia app
│   ├── .env.example
│   └── package.json
├── frontend/                 # Nuxt 3 application
│   ├── components/
│   │   └── FolderTree.vue    # Manually built folder structure component
│   ├── pages/
│   ├── layouts/
│   ├── nuxt.config.ts
│   └── package.json
├── .env.example
├── bun.lockb
└── package.json              # Root package.json
```

## Getting Started

### Prerequisites

  * [Bun](https://bun.sh/) runtime installed.
  * [Docker](https://www.docker.com/) for running PostgreSQL and Redis (recommended).

### 1\. Environment Setup

Create a `.env` file in the root of the project by copying the `.env.example` file.

```bash
cp .env.example .env
```

Update the `.env` file with your database and Redis connection details.

### 2\. Database and Caching

Start the PostgreSQL and Redis containers using Docker Compose.

```bash
docker-compose up -d
```

### 3\. Install Dependencies

Navigate to the project root and install all dependencies for both the frontend and backend workspaces.

```bash
bun install
```

### 4\. Running the Applications

From the project root, you can run both applications concurrently.

**Start the Backend API:**

```bash
bun dev:backend
```

**Start the Frontend App:**

```bash
bun dev:frontend
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001` (or as configured).

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

  * **File Explorer Interface:** A two-panel interface to browse folder structures.
  * **Folder Tree:** The folder structure is built from scratch with Vue 3 and the Composition API.
  * **Scalable Backend:** Uses Elysia with a service and repository layer, and Redis caching for improved performance.
  * **Testing:** Comprehensive testing suite with Vitest for unit/integration tests and Cypress for end-to-end tests.

## Testing

**Run All Tests:**

```bash
bun test
```

This command will run all Vitest unit and integration tests.

**Run E2E Tests (Cypress):**

```bash
bun cypress
```