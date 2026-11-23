import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5300,
    strictPort: true, // fail loudly instead of silently moving to another port
    open: true, // open the portfolio in the browser on `npm run dev`
  },
  preview: {
    port: 4173,
  },
});
