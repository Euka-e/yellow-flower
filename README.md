# Yellow Flower 🌻

Una página web interactiva tierna y caricaturesca donde puedes hacer crecer una flor amarilla haciendo clic en un botón. Construida con Vue.js y Canvas 2D.

## 🌸 Características

- **Montículo de tierra**: Ocupa 1/4 de la pantalla en la parte inferior con textura realista
- **Flor amarilla animada**: Crece suavemente cuando haces clic en "Regar"
- **Mensaje de amor**: Aparece "Feliz Primavera mi amor ❤️" cuando la flor florece
- **Estilo tierno**: Diseño caricaturesco con colores suaves y animaciones fluidas
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🎨 Tecnologías Utilizadas

- **Vue.js 3**: Framework reactivo para la interfaz de usuario
- **Canvas 2D**: Para renderizar los gráficos de la flor y el montículo
- **Vite**: Herramienta de construcción rápida para desarrollo
- **CSS3**: Animaciones y estilos modernos

## 📚 Conceptos de Vue.js Explicados

### Estructura de Componentes
- **Template**: Define la estructura HTML del componente
- **Script**: Contiene la lógica JavaScript y el estado reactivo
- **Style**: Estilos CSS con scope limitado al componente

### Reactividad en Vue
- **data()**: Función que retorna las variables reactivas
- **mounted()**: Hook que se ejecuta cuando el componente se monta
- **methods**: Funciones que pueden ser llamadas desde el template

### Directivas Vue
- **@click**: Escucha eventos de clic
- **:disabled**: Vincula propiedades de forma reactiva
- **v-if**: Renderizado condicional
- **:class**: Clases CSS dinámicas

## 🎮 Cómo Funciona

1. Al cargar la página, se dibuja un montículo de tierra en la parte inferior
2. El botón "💧 Regar" está disponible para interactuar
3. Al hacer clic, la flor crece con una animación suave durante 2 segundos
4. Aparece el mensaje de amor con una transición elegante
5. La flor se puede regar múltiples veces para ver la animación

## 💡 Detalles Técnicos

### Canvas 2D
- Se usa para dibujar el montículo y la flor de forma programática
- Permite animaciones fluidas controlando el frame rate
- Responsive y se adapta al tamaño de la ventana

### Animaciones
- **Easing cubic**: Función matemática para animaciones suaves
- **RequestAnimationFrame**: Para animaciones sincronizadas con el navegador
- **CSS Transitions**: Para animaciones de la interfaz

¡Disfruta haciendo crecer tu flor de amor! 🌻💕
