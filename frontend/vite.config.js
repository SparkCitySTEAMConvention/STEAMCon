import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_API_PROXY_TARGET')

  return {
    plugins: [react()],
    // Preview inherits server.proxy, so enable this only for the dev server.
    server: command === 'serve' && !isPreview ? {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    } : {},
  }
})
