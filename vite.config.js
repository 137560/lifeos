import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'LifeOS · 个人观测站',
        short_name: 'LifeOS',
        description: '用数据观测自己，看清什么影响你的行为',
        theme_color: '#6366f1',
        background_color: '#f9fafb',
        display: 'standalone',
        start_url: '/lifeos/',
        icons: [
          { src: '/lifeos/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/lifeos/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/lifeos/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  base: '/lifeos/',
  build: { outDir: 'docs', emptyOutDir: true },
})
