import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Placeholder data is imported from ../backend/fake_data
  server: { fs: { allow: ['..'] } },
})
