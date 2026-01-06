import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Tetap pertahankan ini biar akses lokal gampang
    // 🗑️ PROXY KITA HAPUS TOTAL (Karena kita sudah handle URL di api.ts)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // Tambahan penting buat Extension build (Opsional tapi Recommended)
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});