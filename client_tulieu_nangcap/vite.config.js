import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  server: {
    proxy: {
      '^/vuejx/.*': {
        target: 'https://quantridulieu.ceid.gov.vn/vuejx/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vuejx/, '')
      },
      '/vuejx/': {
        target: 'https://quantridulieu.ceid.gov.vn/vuejx/',
        changeOrigin: true,
        configure: (proxy, options) => {
        }
      },
      '^/security/.*': {
        target: 'https://quantridulieu.ceid.gov.vn/security/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/security/, '')
      },
      '/security/': {
        target: 'https://quantridulieu.ceid.gov.vn/security/',
        changeOrigin: true,
        configure: (proxy, options) => {
        }
      },
      '^/form/.*': {
        target: 'https://quantridulieu.ceid.gov.vn/form/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/form/, '')
      },
      '/form/': {
        target: 'https://quantridulieu.ceid.gov.vn/form/',
        changeOrigin: true,
        configure: (proxy, options) => {
        }
      },
      '^/static/.*': {
        target: 'https://quantridulieu.ceid.gov.vn/static/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/static/, '')
      },
      '/page': 'https://quantridulieu.ceid.gov.vn/static/',
      '/images': 'https://quantridulieu.ceid.gov.vn/images/'
    }
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-browser.prod.js'
    }
  },
  productionSourceMap: false,
  runtimeCompiler: true,
  build: {
    rollupOptions: {
      external: [            
        "trading-vue-js"
      ],
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  },
  plugins: [
    vue()
  ],
});
