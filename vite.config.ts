import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import vitePluginCesium from 'vite-plugin-cesium';

const cesium = vitePluginCesium as unknown as () => Plugin;

export default defineConfig({
  plugins: [react(), tailwindcss(), cesium()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/health': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
