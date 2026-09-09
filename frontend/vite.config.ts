import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En dev, el frontend llama a /api/... y Vite lo reenvía al backend
// (http://localhost:3000), evitando CORS. Se puede sobreescribir el
// destino con VITE_API_TARGET.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
