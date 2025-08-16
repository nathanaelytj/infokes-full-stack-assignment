# E2E tests (Cypress)

This folder contains Cypress end-to-end tests for the Nuxt frontend.

## Commands

- Install deps:
  - In this folder: `npm i`
  - In `../frontend`: `npm i` (or `bun install`)
- Run interactive with app auto-start:
  - `npm run dev`
- Run headless (CI style):
  - `npm run ci`

The tests stub the backend API (`/api/v1/items` and `/api/v1/items/search`).
Set `BACKEND_URL` in the frontend to `http://localhost:3000` (default) so requests go to same origin and can be intercepted.
