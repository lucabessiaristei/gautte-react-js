import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
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
