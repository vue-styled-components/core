import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import p from '../plugins/typescript-syntax/index'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {},
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.less'],
  },
  plugins: [
    p() as any,
    vue({
      script: {
        defineModel: true,
      },
    }),
    vueJsx(),
  ],
})
