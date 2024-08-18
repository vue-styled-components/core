import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@/': new URL('../core/', import.meta.url).pathname,
      '@vue-styled-components/core': new URL('../core/', import.meta.url).pathname,
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
  ],
})
