import { defineConfig } from 'vite'

export default defineConfig({
  base: '/melbi-zei-lojban/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    open: true,
  },
})
