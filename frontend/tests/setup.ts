// Basic test setup for Vitest + Nuxt
import { beforeAll, afterAll } from "vitest";

// If your test environment lacks global fetch, consider using jsdom or add a lightweight polyfill per test.

// Optionally stub Nuxt components used by app.vue if needed.
// Using global stubs in each test is also fine.
beforeAll(() => {
  // noop for now
});

afterAll(() => {
  // noop
});
