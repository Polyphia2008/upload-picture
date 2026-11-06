import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/animejs')) return 'anime'
          if (id.includes('node_modules/ant-design-vue') || id.includes('node_modules/@ant-design')) return 'antd'
          if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) return 'vue'
        }
      }
    }
  }
})
