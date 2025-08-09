import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'vanilj',
      formats: ['es', 'umd'],
      fileName: (format) => `vanilj.${format}.js`,
    },
    outDir: 'dist',
    minify: true,
  }
})