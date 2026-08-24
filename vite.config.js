// Archivo: vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 🚀 1. RECUPERAMOS TAILWIND
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 🚀 2. AQUÍ VUELVE LA MAGIA DEL DISEÑO
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer', // 🚀 ¡LÍNEA MÁGICA PARA LIGHTHOUSE! (Antes estaba en 'auto')
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000, // 🚀 Aumentamos el límite a 5MB para soportar SVGs grandes
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /.*\/profesionales.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-profesionales-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días offline
              },
            },
          },
          {
            urlPattern: /^https:\/\/(res\.cloudinary\.com|ui-avatars\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagenes-externas',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          }
        ]
      },
      manifest: {
        name: "Tarjetoso", // 🚀 CAMBIADO AQUÍ
        short_name: "Tarjetoso",      // 🚀 CAMBIADO AQUÍ (Nombre en el ícono del celular)
        start_url: "/",
        display: "standalone",
        background_color: "#1A535C",
        theme_color: "#1A535C",
        description: "Directorio de Tarjetas Digitales Tarjetoso", // 🚀 CAMBIADO AQUÍ
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2015'
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})