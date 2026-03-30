// Archivo: vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' 
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        cacheId: 'spinjob-v3-stable', 
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // 🚨 EVITA EL BUCLE: No cachear el documento principal para rutas de perfil
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/], 
        runtimeCaching: [
          {
            // Caché para la API de profesionales
            urlPattern: ({ url }) => url.pathname.startsWith('/profesionales'),
            handler: 'NetworkFirst', 
            options: {
              cacheName: 'api-data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
              }
            },
          },
          {
            // Caché para imágenes de Cloudinary y Avatares
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
        name: "SpinJob Directorio",
        short_name: "SpinJob",      
        start_url: "/",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#1E3D51",
        description: "Directorio de Tarjetas Digitales SpinJob",
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
})