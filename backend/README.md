# Windows Explorer Backend

## Description

This is the backend service for the Windows Explorer application. Built with Elysia, it serves as the API for the frontend, providing a scalable and high-performance way to manage and retrieve folder and file data. The architecture is designed with separation of concerns in mind, using a service and repository pattern.

## Technologies

- **Framework:** [Elysia](https://elysiajs.com/)
- **Runtime:** [Bun](https://bun.sh/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Caching:** [Redis](https://redis.io/)
- **Testing:** [Vitest](https://vitest.dev/)

## Architecture

The backend follows a clean architecture pattern with distinct layers to improve maintainability and testability:

- **Repository Layer:** Handles all direct interactions with the database (PostgreSQL) and the cache (Redis). It abstracts the data storage details away from the rest of the application.
- **Service Layer:** Contains the business logic. It orchestrates calls to the repository layer and applies business rules to the data before returning it.
- **Elysia Routes:** Define the API endpoints. They are kept "thin" and primarily responsible for handling HTTP requests and responses by calling the appropriate service methods.

## Project Structure

```
/backend
├── src/
│   ├── services/         # Business logic: orchestrates data and applies rules
│   │   └── folder.service.ts
│   ├── repositories/     # Data access: handles communication with DB and cache
│   │   └── folder.repository.ts
│   ├── plugins/          # Elysia plugins for dependencies like Redis or DB
│   │   ├── redis.plugin.ts
│   │   └── db.plugin.ts
│   └── index.ts          # Main Elysia application and route definitions
├── .env.example          # Template for environment variables
├── package.json          # Package dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime installed.
- [Docker](https://www.docker.com/) for running PostgreSQL and Redis.

### 1\. Environment Setup

Create a `.env` file from the example and configure your database and Redis connection details.

```bash
cp .env.example .env
```

### 2\. Database and Caching

The `docker-compose.yml` file in the project root can be used to start the necessary services. From the root directory of the monorepo:

```bash
docker-compose up -d postgres redis
```

### 3\. Install Dependencies

From the `/backend` directory, install the dependencies.

```bash
cd backend
bun install
```

### 4\. Running the Application

To start the development server, run the following command from the `/backend` directory:

```bash
bun dev
```

The backend API will be available at `http://localhost:3001` (or the port defined in your `.env` file).

## API Endpoints

The backend provides the following key endpoints:

### `GET /api/folders`

- **Description:** Retrieves the complete hierarchical folder structure. This endpoint is called on initial page load to populate the left-hand panel.
- **Response:** A JSON object representing the entire folder tree.

### `GET /api/folders/:id`

- **Description:** Retrieves the direct subfolders and files for a specific folder.
- **URL Parameters:**
  - `id` (string): The unique identifier of the folder to retrieve contents for.
- **Response:** A JSON object containing an array of folders and files.

# Backend

Clean Architecture with Elysia + Prisma + Redis.

- REST: /api/v1
- Entities: Item (folder/file), hierarchical via parentId

## Run

1. Copy `.env.example` to `.env` and set DATABASE_URL (+ REDIS_URL optional)
2. Install deps and generate Prisma client
3. Push schema or run migrations
4. Start server

## REST endpoints

- GET /api/v1/health
- GET /api/v1/items
- GET /api/v1/items/:id
- GET /api/v1/items/children?parentId=<uuid|null>
- POST /api/v1/items { name, parentId, type }
- PATCH /api/v1/items/:id { name?, parentId? }
- DELETE /api/v1/items/:id
