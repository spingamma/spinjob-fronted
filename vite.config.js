import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 ¡El nuevo motor importado!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 ¡Encendido!
  ],
})