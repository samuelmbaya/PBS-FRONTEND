import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // allows access from any network (useful in EC2/local dev)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://44.198.25.29:3000', // your backend API base
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // optional clean path
      },
    },
  },
});
