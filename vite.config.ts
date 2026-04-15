import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /api/* to the local dev API server (scripts/dev-api.ts)
      '/api': 'http://localhost:3001',
    },
  },
})
