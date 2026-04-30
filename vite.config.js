import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files so VITE_API_URL works in dev proxy
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = (env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

  return {
    plugins: [react(), tailwindcss()],

    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('@tanstack/react-query')) return 'vendor-query';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('i18next')) return 'vendor-i18n';
            if (id.includes('@headlessui')) return 'vendor-headless';
            if (id.includes('socket.io')) return 'vendor-socket';
            if (id.includes('axios')) return 'vendor-http';
          },
        },
      },
    },
    server: {
      proxy: {
        // In dev, frontend uses same origin (/api); proxy forwards to backend (see .env VITE_API_URL)
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
