# Windows Explorer Frontend

## Description

This is the frontend application for the Windows Explorer project. Built with Nuxt 3, it consumes the backend API to provide a dynamic and responsive user interface. The primary feature is a two-panel layout: a left-hand panel displaying a fully-featured, collapsible folder tree and a right-hand panel for showing the contents of the selected folder.

## Technologies

- **Framework:** [Nuxt 3](https://nuxt.com/)
- **UI Library:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Testing:** [Cypress](https://www.cypress.io/)
- **Runtime:** [Bun](https://bun.sh/)

## Project Structure

```
/frontend
├── components/
│   ├── FolderTree.vue      # The core component for displaying the folder hierarchy
│   ├── FolderTreeItem.vue  # A recursive component for each folder/file node
│   └── ...
├── pages/
│   └── index.vue           # The main page that hosts the two-panel layout
├── composables/            # Reusable logic, e.g., for fetching data from the API
│   └── useFolderStore.ts
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

### E2E Testing with Cypress

To run the end-to-end tests for the frontend, ensure the backend is running and then execute the following command from the `/frontend` directory:

```bash
bun cypress
```
