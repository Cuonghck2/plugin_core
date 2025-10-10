const path = require('path');
const { defineConfig } = require('vite');
const vue = require('@vitejs/plugin-vue');

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'ui',
      fileName: (format) => `ui.${format}.js`,
    }
  },
  plugins: [vue({ customElement: true })]
});
