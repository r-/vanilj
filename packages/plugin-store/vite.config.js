import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  const isMinified = mode === 'production'
  
  return {
    build: {
      outDir: 'dist',
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'VaniljPluginStore',
        fileName: (format) => {
          const suffix = isMinified ? '.min' : ''
          return `vanilj-plugin-store${suffix}.${format}.js`
        },
        formats: ['es', 'umd']
      },
      rollupOptions: {
        external: ['@vanilj/core'],
        output: {
          globals: {
            '@vanilj/core': 'VaniljCore'
          },
          exports: 'auto'
        }
      },
      minify: isMinified ? 'terser' : false,
      sourcemap: true
    }
  }
})