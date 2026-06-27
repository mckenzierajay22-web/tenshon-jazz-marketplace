import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'app.html',
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
})
