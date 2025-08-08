import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  const isMinified = mode === 'production'
  
  return {
    build: {
      outDir: isMinified ? 'dist/min' : 'dist/dev',
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'VaniljCore',
        fileName: (format) => `vanilj-core.${format}.js`,
        formats: ['es', 'umd']
      },
      rollupOptions: {
        external: [],
        output: {
          globals: {},
          exports: 'auto'
        }
      },
      minify: isMinified ? 'terser' : false,
      sourcemap: true
    }
  }
})