# Windows Explorer Frontend

## Description

This is the frontend application for the Windows Explorer project. Built with Nuxt 3, it consumes the backend API to provide a dynamic and responsive user interface. The primary feature is a two-panel layout: a left-hand panel displaying a fully-featured, collapsible folder tree and a right-hand panel for showing the contents of the selected folder.

## Technologies

- **Framework:** [Nuxt 4](https://nuxt.com/) (Using Vue 3 Composition API)
- **UI Library:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Unit Testing:** [Vitest](https://vitest.dev/) + [@testing-library/vue](https://testing-library.com/docs/vue-testing-library/intro/)
- **E2E Testing:** Managed at repository root (not in frontend)
- **Runtime:** [Bun](https://bun.sh/)

## Project Structure

```
/frontend
├── components/
│   └── explorer/
│       ├── Tree.vue        # Folder tree root
│       ├── TreeItem.vue    # Recursive node
│       └── RightPanel.vue  # Contents of selected folder
├── pages/
│   └── index.vue           # The main page that hosts the two-panel layout
├── composables/            # Reusable logic, e.g., for fetching data from the API
│   ├── useExplorerData.ts
│   └── useExplorerState.ts
├── layouts/
├── nuxt.config.ts          # Nuxt configuration file
├── package.json            # Package dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime installed.
- The backend API must be running.

### 1\. Install Dependencies

From the `/frontend` directory, install the dependencies.

```bash
cd frontend
bun install
```

### 2\. Running the Application

To start the development server, run the following command from the `/frontend` directory:

```bash
bun dev
```

The frontend application will be available at `http://localhost:3000`.

## Features

### Two-Panel Layout

- **Left Panel:** Displays the full folder hierarchy. The folders can be expanded and collapsed.
- **Right Panel:** Displays the direct subfolders and files of the folder selected in the left panel.

### Folder Tree from Scratch

The folder structure component is built manually using Vue 3's Composition API and a recursive component pattern. No third-party folder tree libraries are used, as per project requirements.

### Responsive Design

The layout is fully responsive and optimized for a seamless experience on both desktop and mobile devices, thanks to Tailwind CSS.

## Testing

### Unit Testing with Vitest

This project includes unit tests for components and composables using Vitest and @testing-library/vue (jsdom).

Recommended (Node-based runner):

```bash
# run once
npx vitest run --reporter=verbose

# watch mode
npx vitest
```

Avoid running with Bun’s built-in test runner, which does not transform .vue files or Nuxt aliases:

```bash
# NOT supported for these unit tests
bun test        # will fail to resolve ~/@ aliases and .vue SFCs
bun x vitest    # may hit Bun/tinypool worker errors
bun run test           # Vitest caught 3 unhandled errors during the test run.
bun run test:watch     # Vitest caught 3 unhandled errors during the test run.
bun run test:coverage  # Vitest caught 3 unhandled errors during the test run.
```

Notes:

- Tests mock `useExplorerData` and stub `UIcon` to avoid backend coupling and heavy DOM.
- `useExplorerData` itself is intentionally not tested until the backend is available.
- Aliases `~` and `@` resolve to the project root in `vitest.config.ts`.

### Troubleshooting

- If you see errors like `Cannot access 'dispose' before initialization` under Bun when running Vitest, use the Node-based command `npx vitest` as shown above.

### End-to-End (E2E) Tests

E2E tests are located and run from the repository root. Refer to the root-level README for instructions.
