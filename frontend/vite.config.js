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
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://report-git.onrender.com')
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://report-git.onrender.com',
        changeOrigin: true,
        secure: true,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    commonjsOptions: {
      include: [/react-icons/, /node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-icons': ['react-icons'],
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            'axios'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-icons',
      'react-icons/fa',
      'react-icons/md',
      'react-icons/io',
      'react-icons/bi',
      'react-icons/fi',
      'react-icons/gi',
      'react-icons/hi',
      'react-icons/ri',
      'react-icons/si',
      'react-icons/ti',
      'react-icons/wi',
      'react-icons/go'
    ]
  }
})
