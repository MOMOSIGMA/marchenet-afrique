import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Define default backend URL
const defaultBackend = 'https://marchenet-server.onrender.com';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: defaultBackend,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/upload': {
        target: defaultBackend,
        changeOrigin: true,
      },
      '/auth': {
        target: defaultBackend,
        changeOrigin: true,
      },
    },
  },
});