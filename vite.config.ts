import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'core/config.ts'),
      name: 'Bundle',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@/': new URL('./core/', import.meta.url).pathname,
      '@vvide/vue-styled-components': new URL('./core', import.meta.url).pathname,
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.less'],
  },
  plugins: [
    vue({
      script: {
        defineModel: true,
      },
    }),
    vueJsx(),
    dts(),
  ],
  test: {
    clearMocks: true,
    environment: 'jsdom',
    reporters: ['default'],
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    },
  },
})
