import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Nuxt uses ~ and @ to point to project root / src
      "~": rootDir,
      "@": rootDir,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Inline Nuxt-specific runtime deps so vitest doesn't try to mock them
    deps: {
      inline: [/nuxt/, /@nuxt/],
    },
    setupFiles: ["./tests/setup.ts"],
  },
});
