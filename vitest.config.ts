import { defineConfig } from 'vitest/config'

// Sarv's tests only. Without this, the default glob also picks up fitraa/,
// which is a separate project with its own dependencies and test runner.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'fitraa/**', 'docs/**'],
  },
})
