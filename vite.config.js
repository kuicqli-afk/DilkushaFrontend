// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5174,
    fs: {
      strict: false,
    },
  },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // React and Swiper change far less often than app code: as separate files
        // they stay cached in visitors' browsers across deploys. Everything else
        // is left to Rollup so libraries used only by lazy pages stay with them.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return "react";
          if (id.includes("swiper")) return "swiper";
          return undefined;
        },
      },
    },
  },
})
