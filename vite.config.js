import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5300,
    strictPort: true, // fail loudly instead of silently moving to another port
  },
  preview: {
    port: 4173,
  },
});
