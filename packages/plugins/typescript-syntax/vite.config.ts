import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './index.ts'),
      name: 'VueStyledComponentsTypescriptSyntax',
      fileName: 'index',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
      external: ['vite', '@babel/core', '@babel/parser', '@babel/traverse', '@babel/types', 'magic-string'],
    },
  },
  plugins: [
    dts({
      include: ['index.ts', './src/**/*.ts'],
      exclude: ['__test__'],
    }),
  ],
})
