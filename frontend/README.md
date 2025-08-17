# Windows Explorer Frontend

Nuxt 4 app that renders a two-panel Explorer UI: a collapsible tree on the left and the selected folder’s contents on the right. Talks to the backend API.

## Tech

- Nuxt 4 (Vue 3, Composition API)
- Tailwind CSS (via Vite plugin)
- TypeScript
- Vitest + @testing-library/vue (unit)
- Runtime: Bun

## Structure

```
frontend/
├─ components/
│  ├─ SearchBar.vue
│  └─ explorer/
│     ├─ Tree.vue
│     ├─ TreeItem.vue
│     └─ RightPanel.vue
├─ composables/
│  ├─ useExplorerData.ts     # API calls
│  ├─ useExplorerSearch.ts   # search logic
│  └─ useExplorerState.ts    # selection/expand state
├─ pages/index.vue
├─ assets/css/tailwind.css
├─ nuxt.config.ts            # runtimeConfig: public.backendUrl, HMR vars
└─ vitest.config.ts          # ~ and @ aliases for tests
```

## Setup

Prereqs: Bun, and the backend API running.

1. Install deps

```
bun install
```

2. Configure runtime

The app reads these envs (see `nuxt.config.ts`):

- BACKEND_URL: defaults to http://localhost:3000; set to your backend (e.g. http://localhost:3001)
- HMR_HOST, HMR_CLIENT_PORT: optional for dev behind proxies

3. Run dev server

```
bun dev
```

App runs on http://localhost:3000 by default.

## Testing

Use Node-based Vitest for Vue/Nuxt SFCs:

```
npx vitest run --reporter=verbose    # once
npx vitest                           # watch
```

Project scripts are also available:

```
bun run test
bun run test:watch
bun run test:coverage
```

Notes

- Tests mock `useExplorerData` and stub UI icons to avoid backend coupling.
- Aliases `~` and `@` are configured in `vitest.config.ts`.

## Features

- Recursive tree component built from scratch (no 3rd‑party tree lib)
- Search and filter support via composables
- Responsive layout using Tailwind

## Troubleshooting

- If Bun + Vitest shows worker or alias issues, prefer the Node runner shown above.

## E2E

Any end-to-end tests live at the repo root (not in `frontend/`).
