import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon-192.jpeg',
          'icon-512.jpeg',
          'assets/aistudio/WhatsApp_Image_2026-11-02_at_11.08.09_AM__1__d83e939e.jpeg',
        ],
        manifest: {
          id: './',
          name: "What's up",
          short_name: "What's up",
          description: "Interactive WhatsApp Web clone with real-time chats, voice messages, unlimited file sharing, and live animated profile media.",
          theme_color: '#111b21',
          background_color: '#111b21',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: './',
          scope: './',
          categories: ['social', 'productivity'],
          icons: [
            {
              src: 'icon-192.jpeg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: 'icon-512.jpeg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: 'assets/aistudio/WhatsApp_Image_2026-11-02_at_11.08.09_AM__1__d83e939e.jpeg',
              sizes: '1600x1600',
              type: 'image/jpeg',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
