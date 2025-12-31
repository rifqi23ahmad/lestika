import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- Pastikan baris ini ada

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Pastikan plugin ini dipanggil
  ],
})