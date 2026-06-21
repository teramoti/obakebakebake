import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: false,
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
})
