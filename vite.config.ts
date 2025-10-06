import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ for Netlify or any custom domain
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
