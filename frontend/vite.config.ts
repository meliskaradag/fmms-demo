import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/fmms-demo/' : '/',
  plugins: [react()],
  server: {
    port: 15173,
  },
  preview: {
    port: 15174,
  },
})
