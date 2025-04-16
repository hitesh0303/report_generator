import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react-icons/fa'],
      output: {
        globals: {
          'react-icons/fa': 'ReactIconsFa'
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react-icons']
  }
})
