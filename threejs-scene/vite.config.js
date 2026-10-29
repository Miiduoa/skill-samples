import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 4876,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4876,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
})
