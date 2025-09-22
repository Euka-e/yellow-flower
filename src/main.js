// main.js - Punto de entrada de nuestra aplicación Vue
import { createApp } from 'vue'
import SimpleApp from './SimpleApp.vue'

// Crear la aplicación Vue y montarla en el elemento con id "app"
// createApp es la nueva forma de crear aplicaciones en Vue 3
createApp(SimpleApp).mount('#app')