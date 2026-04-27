import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Required when reverse-proxying (e.g. Caddy) — Vite rejects unknown Host headers by default.
    allowedHosts: true,
  },
})
