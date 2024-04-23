import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': new URL('./', import.meta.url).pathname
    },
    extensions: ['.ts', '.jsx', '.tsx', '.json', '.vue', '.less']
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    reporters: ['default'],
    coverage: {
      reporter: ['text', 'json-summary', 'json']
    }
  }
})
