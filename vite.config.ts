import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.svg'],
      manifest: {
        name: 'GymLog',
        short_name: 'GymLog',
        description: 'Il tuo diario di allenamento in palestra',
        theme_color: '#f97316',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Metti in cache tutti gli asset dell'app
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Strategia offline-first: usa sempre la cache, aggiorna in background
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tobia232\.github\.io\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gymlog-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
