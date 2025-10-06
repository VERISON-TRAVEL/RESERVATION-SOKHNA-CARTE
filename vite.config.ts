import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isNetlify ? '/' : '/RESERVATION-SOKHNA-CARTE/', // ✅ Auto-switch
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
