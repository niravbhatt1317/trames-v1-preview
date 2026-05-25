import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves project sites under /<repo-name>/, so production
// builds need that base path. Local dev still serves from /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/trames-v1-preview/' : '/',
  plugins: [react(), tailwindcss()],
}))
