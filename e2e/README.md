
# E2E tests (Cypress)

This folder contains Cypress end-to-end tests for the Nuxt frontend. Tests stub the backend API endpoints `/api/v1/items` and `/api/v1/items/search` via `cy.intercept`.

## Prerequisites

- Node 18+ (for running Cypress in this folder)
- npm (or yarn)
- In the monorepo: Bun is used for frontend/backend development (install in those folders with `bun install`)

## Install

- From this folder (e2e):

	`npm install`

- From the frontend folder (to run Nuxt dev):

	`cd ../frontend && bun install`  (or `npm install` if you prefer)

## Runs

- Interactive runner (opens Cypress UI and will auto-start app when configured):

	`npm run dev`

- Headless (CI style):

	`npm run ci`

The e2e project is configured with `baseUrl: http://frontend:3000` (see `cypress.config.ts`). Tests set Nuxt’s runtime `public.backendUrl` at visit-time so the app fetches from the desired backend host, and intercepts use wildcard URL patterns (e.g. `**/api/v1/items*`) so they match whether the backend is same-origin or cross-origin.

### Local vs containerized

- Containerized: frontend runs as `http://frontend:3000`, backend as `http://backend:3000`. Tests override `backendUrl` to `http://backend:3000` so requests go cross-origin and are still intercepted via `**/api/v1/...` patterns.

- Pure local: if you run Nuxt at `http://localhost:3000` and backend at `http://localhost:3001`, set `BACKEND_URL=http://localhost:3001` when starting the frontend. Intercepts still match because they use wildcards.

### Troubleshooting

- If a `cy.wait('@getItems')` times out, open the Cypress Network panel to confirm the actual URL requested and ensure it matches `**/api/v1/items*`.
- If a selector fails, prefer `data-testid` attributes and stable text content; some Nuxt UI components render internal markup differently between dev and build.

If you need to run a single spec locally, open the Cypress UI (`npm run dev`) and pick the spec, or run a single spec headless with the appropriate CLI flags.
