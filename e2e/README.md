# E2E tests (Cypress)

This folder contains Cypress end-to-end tests for the Nuxt frontend. Tests stub the backend API endpoints `/api/v1/items` and `/api/v1/items/search` via `cy.intercept`.

## Install

- In this folder: `npm i`
- In `../frontend`: `bun install` (or `npm i`)

## Run

Interactive runner with app auto-start:
- `npm run dev`

Headless (CI style):
- `npm run ci`

The e2e project is configured with `baseUrl: http://frontend:3000` (see `cypress.config.ts`). Tests force Nuxt’s runtime `public.backendUrl` at visit-time so the app fetches from the desired backend host, and intercepts use wildcard URL patterns (e.g. `**/api/v1/items*`) so they match whether the backend is same-origin or cross-origin.

### Local vs containerized

- Containerized: frontend runs as `http://frontend:3000`, backend as `http://backend:3000`. Tests override `backendUrl` to `http://backend:3000` so requests go cross-origin and are still intercepted via `**/api/v1/...` patterns.
- Pure local: if you run Nuxt at `http://localhost:3000` and backend at `http://localhost:3001`, set `BACKEND_URL=http://localhost:3001` when starting the frontend. Intercepts still match because they use wildcards.

Troubleshooting tips:
- If a `cy.wait('@getItems')` times out, open the Cypress Network panel to confirm the actual URL requested and ensure it matches `**/api/v1/items*`.
- If a selector fails, prefer `data-testid` and stable text content. Some Nuxt UI components render internal markup differently between dev and build.
