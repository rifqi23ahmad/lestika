import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'

export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      include: [/\.jsx?$/, /\.js?$/, /main.js/],
      exclude: [/node_modules/],
      apply: 'build', 
      options: {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        debugProtection: true,
        disableConsoleOutput: true, 
        stringArray: true,
        rotateStringArray: true,
      }
    })
  ],
  build: {
    sourcemap: false, 
  }
})