import { defineConfig } from 'vitest/config'

// Only the pure domain modules are unit tested here; they never import React
// Native, so no native mocking is needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
