import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The GitHub Pages site is served from https://<user>.github.io/fitness/, so the
// build needs that sub-path. Override with BASE_PATH=/ for a root-domain deploy
// (Netlify, Vercel, a custom domain).
const base = process.env.BASE_PATH ?? '/fitness/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
