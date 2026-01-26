import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3001,  // 前端开发服务器端口
    proxy: {
      '/admin': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      '/common': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      '/img': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
