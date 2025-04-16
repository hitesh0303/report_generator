import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-icons': 'react-icons'
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://report-git-backend.onrender.com')
  },
  build: {
    commonjsOptions: {
      include: [/react-icons/, /node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-icons': ['react-icons']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react-icons', 'react-icons/fa', 'react-icons/md', 'react-icons/io', 'react-icons/bi', 'react-icons/fi', 'react-icons/gi', 'react-icons/hi', 'react-icons/ri', 'react-icons/si', 'react-icons/ti', 'react-icons/wi', 'react-icons/go']
  }
})
