import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': new URL('./', import.meta.url).pathname
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.less']
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    // setupFiles: ['./vitest.setup.ts'],
    reporters: ['default'],
    testTransformMode: {
      web: ['*.{ts,tsx}']
    },
    coverage: {
      reporter: ['text', 'json-summary', 'json']
    }
  }
})
