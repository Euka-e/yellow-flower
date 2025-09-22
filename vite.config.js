import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuración de Vite para el proyecto Vue
// Vite es una herramienta de construcción rápida que facilita el desarrollo
export default defineConfig({
  plugins: [vue()], // Plugin para trabajar con archivos .vue
  server: {
    port: 3000, // Puerto para el servidor de desarrollo
    open: true // Abre automáticamente el navegador
  }
})