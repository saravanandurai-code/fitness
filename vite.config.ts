import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The GitHub Pages site is served from https://<user>.github.io/fitness/, so the
// build needs that sub-path. Override with BASE_PATH=/ for a root-domain deploy
// (Netlify, Vercel, a custom domain).
const base = process.env.BASE_PATH ?? '/fitness/'

// Build into docs/ so GitHub Pages can serve the compiled app straight from the
// branch ("Deploy from a branch" → /docs) without a separate publish step.
// https://vite.dev/config/
export default defineConfig({
  base,
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  plugins: [react()],
})
