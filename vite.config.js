import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2}'],
        globIgnores: ['**/public_data/**'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/public_data\/trip_stops_index\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gtfs-index-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/public_data\/(stops|routes|trips|calendar|stop_times|shapes|calendar_dates|stop_attributes)\.txt$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gtfs-static-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              matchOptions: {
                ignoreVary: true
              }
            }
          },
          {
            urlPattern: /\/api\/realtime/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gtfs-realtime-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 30
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      },
      manifest: {
        name: 'Transit Map Turin',
        short_name: 'Transit Map',
        description: 'Real-time public transport visualization for Turin',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api/realtime': {
        target: 'https://percorsieorari.gtt.to.it',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => '/das_gtfsrt/trip_update.aspx',
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy request to:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response status:', proxyRes.statusCode);
            console.log('Proxy response headers:', proxyRes.headers);
          });
        }
      }
    }
  }
})