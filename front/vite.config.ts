import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './front', 
  plugins: [react()],
  build: {
    outDir: '../dist', // Выходная папка относительно корня
  },
  server: {
    port: 3000, // Порт для фронтенда
  },
});