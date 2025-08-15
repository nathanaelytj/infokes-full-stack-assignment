// Basic test setup for Vitest + Nuxt
import { beforeAll, afterAll } from 'vitest'

// Provide a minimal global fetch for tests if jsdom doesn't provide one
if (typeof (globalThis as any).fetch === 'undefined') {
  // simple node fetch shim for tests (keeps tests simple)
  // If your environment provides fetch (Node 18+ or jsdom), remove this.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeFetch = require('node-fetch')
  ;(globalThis as any).fetch = nodeFetch
}

// Optionally stub Nuxt components used by app.vue if needed.
// Using global stubs in each test is also fine.
beforeAll(() => {
  // noop for now
})

afterAll(() => {
  // noop
})
