import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // Utiliza las configuraciones de React y Tailwind CSS para Vite
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Agrega un alias para facilitar las importaciones desde la carpeta src
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Filtra los archivos que Vite debe procesar como activos, incluyendo SVG y CSV
  assetsInclude: ['**/*.svg', '**/*.csv'],
})