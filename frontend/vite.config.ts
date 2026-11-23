import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Plugins de React y de Tailwind CSS 4. El alias @/ apunta a src/.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  // Un solo bundle de ~530 kB (React + TanStack + Axios + Zustand): se sube el umbral del aviso
  build: { chunkSizeWarningLimit: 700 },
})
