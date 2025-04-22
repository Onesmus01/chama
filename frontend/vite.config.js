import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['chama-7.onrender.com'],
  },
  server: {
    host: '0.0.0.0', // Allow external access
    port: 4173, // Your preferred port
    proxy: {
      '/api': 'http://localhost:6500', // Ensure this is the correct API URL in your Render deployment
    }
  }
})
