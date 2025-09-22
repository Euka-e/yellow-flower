<!-- App.vue - Componente principal de nuestra aplicación -->
<template>
  <!-- El template define la estructura HTML de nuestro componente -->
  <div class="app-container">
    <!-- Contenedor para la escena 3D de Three.js -->
    <div ref="threeContainer" class="three-container"></div>
    
    <!-- Interfaz de usuario superpuesta -->
    <div class="ui-overlay">
      <!-- Botón para regar y hacer crecer la flor -->
      <button 
        @click="waterFlower" 
        :disabled="isGrowing"
        class="water-button"
        :class="{ 'growing': isGrowing }"
      >
        {{ isGrowing ? '🌱 Creciendo...' : '💧 Regar' }}
      </button>
      
      <!-- Mensaje que aparece cuando crece la flor -->
      <div 
        v-if="showMessage" 
        class="love-message"
        :class="{ 'visible': messageVisible }"
      >
        Feliz Primavera mi amor ❤️
      </div>
    </div>
  </div>
</template>

<script>
// Importamos las librerías necesarias
import * as THREE from 'three'

export default {
  name: 'App',
  data() {
    // data() retorna las variables reactivas del componente
    return {
      // Variables para controlar el estado de la aplicación
      scene: null,          // Escena de Three.js
      camera: null,         // Cámara de Three.js
      renderer: null,       // Renderizador de Three.js
      isGrowing: false,     // Estado del crecimiento de la flor
      showMessage: false,   // Mostrar mensaje de amor
      messageVisible: false, // Animación del mensaje
      
      // Objetos 3D
      dirtMound: null,      // Montículo de tierra
      flower: null,         // Flor amarilla
      flowerGroup: null,    // Grupo que contiene la flor completa
    }
  },
  
  // mounted() se ejecuta cuando el componente se monta en el DOM
  mounted() {
    // Usar nextTick para asegurar que el DOM esté completamente renderizado
    this.$nextTick(() => {
      this.initThreeJS()
      this.createScene()
      this.animate()
    })
  },
  
  // beforeUnmount() se ejecuta antes de que el componente se destruya
  beforeUnmount() {
    // Limpiamos los recursos de Three.js para evitar memory leaks
    if (this.renderer) {
      this.renderer.dispose()
    }
    if (window.removeEventListener) {
      window.removeEventListener('resize', this.onWindowResize)
    }
  },
  
  methods: {
    // Inicializar Three.js
    initThreeJS() {
      try {
        const container = this.$refs.threeContainer
        if (!container) {
          console.error('Container not found')
          return
        }
        
        const width = container.clientWidth || window.innerWidth
        const height = container.clientHeight || window.innerHeight
        
        console.log('Initializing Three.js with dimensions:', width, height)
        
        // Crear la escena (el "mundo" donde pondremos nuestros objetos 3D)
        this.scene = new THREE.Scene()
        
        // Crear la cámara (nuestro "ojo" para ver la escena)
        // PerspectiveCamera simula como vemos las cosas en la vida real
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        this.camera.position.set(0, 1, 4) // Posicionar la cámara para ver mejor el montículo
        this.camera.lookAt(0, -1, 0) // Mirar hacia el montículo
        
        // Crear el renderizador (lo que dibuja la escena en pantalla)
        this.renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        })
        this.renderer.setSize(width, height)
        this.renderer.setClearColor(0x000000, 0) // Fondo transparente
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        
        // Añadir el canvas del renderizador al DOM
        container.appendChild(this.renderer.domElement)
        
        // Manejar redimensionamiento de ventana
        this.onWindowResize = this.onWindowResize.bind(this)
        window.addEventListener('resize', this.onWindowResize)
        
        console.log('Three.js initialized successfully')
      } catch (error) {
        console.error('Error initializing Three.js:', error)
      }
    },
    
    // Crear los elementos de la escena
    createScene() {
      try {
        console.log('Creating scene elements...')
        
        // Crear iluminación para que podamos ver los objetos
        // AmbientLight ilumina todo de manera uniforme
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        this.scene.add(ambientLight)
        
        // DirectionalLight simula la luz del sol
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(10, 10, 5)
        this.scene.add(directionalLight)
        
        // Crear el montículo de tierra
        this.createDirtMound()
        
        console.log('Scene created successfully')
      } catch (error) {
        console.error('Error creating scene:', error)
      }
    },
    
    // Crear el montículo de tierra
    createDirtMound() {
      // SphereGeometry crea una esfera, la cortamos por la mitad para hacer un montículo
      // Hacemos el montículo más grande y lo posicionamos en la parte inferior
      const geometry = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
      
      // Material marrón para simular tierra
      const material = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513  // Color marrón
      })
      
      this.dirtMound = new THREE.Mesh(geometry, material)
      this.dirtMound.position.set(0, -1.5, 0) // Posicionar para que ocupe el cuarto inferior
      this.scene.add(this.dirtMound)
    },
    
    // Crear la flor amarilla
    createFlower() {
      // Group agrupa varios objetos para manipularlos juntos
      this.flowerGroup = new THREE.Group()
      
      // Crear el tallo (un cilindro verde)
      const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8)
      const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }) // Verde
      const stem = new THREE.Mesh(stemGeometry, stemMaterial)
      stem.position.y = 0.75 // Centrar el tallo
      this.flowerGroup.add(stem)
      
      // Crear los pétalos de la flor
      const petalGeometry = new THREE.SphereGeometry(0.3, 16, 8)
      const petalMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 }) // Amarillo dorado
      
      // Crear varios pétalos alrededor del centro
      for (let i = 0; i < 8; i++) {
        const petal = new THREE.Mesh(petalGeometry, petalMaterial)
        const angle = (i / 8) * Math.PI * 2
        petal.position.x = Math.cos(angle) * 0.4
        petal.position.z = Math.sin(angle) * 0.4
        petal.position.y = 1.5
        petal.scale.set(0.8, 0.3, 0.8) // Aplanar los pétalos
        this.flowerGroup.add(petal)
      }
      
      // Crear el centro de la flor
      const centerGeometry = new THREE.SphereGeometry(0.2, 16, 8)
      const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 }) // Naranja
      const center = new THREE.Mesh(centerGeometry, centerMaterial)
      center.position.y = 1.5
      this.flowerGroup.add(center)
      
      // Inicializar la flor muy pequeña (escala 0)
      this.flowerGroup.scale.set(0, 0, 0)
      this.flowerGroup.position.set(0, -1.5, 0) // Posición en el montículo
      
      this.scene.add(this.flowerGroup)
    },
    
    // Función que se ejecuta cuando se hace clic en "Regar"
    async waterFlower() {
      if (this.isGrowing) return // Prevenir múltiples clics
      
      this.isGrowing = true
      
      // Crear la flor si no existe
      if (!this.flowerGroup) {
        this.createFlower()
      }
      
      // Animar el crecimiento de la flor
      await this.animateFlowerGrowth()
      
      // Mostrar el mensaje de amor
      this.showLoveMessage()
      
      this.isGrowing = false
    },
    
    // Animar el crecimiento de la flor
    animateFlowerGrowth() {
      return new Promise((resolve) => {
        const duration = 2000 // 2 segundos
        const startTime = Date.now()
        const startScale = 0
        const endScale = 1
        
        const animate = () => {
          const elapsedTime = Date.now() - startTime
          const progress = Math.min(elapsedTime / duration, 1)
          
          // Función de easing para una animación más suave
          const easeProgress = 1 - Math.pow(1 - progress, 3)
          
          const currentScale = startScale + (endScale - startScale) * easeProgress
          this.flowerGroup.scale.set(currentScale, currentScale, currentScale)
          
          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            resolve()
          }
        }
        
        animate()
      })
    },
    
    // Mostrar el mensaje de amor
    showLoveMessage() {
      this.showMessage = true
      
      // Pequeño delay para la animación CSS
      setTimeout(() => {
        this.messageVisible = true
      }, 100)
    },
    
    // Manejar redimensionamiento de ventana
    onWindowResize() {
      const container = this.$refs.threeContainer
      const width = container.clientWidth
      const height = container.clientHeight
      
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    },
    
    // Loop de animación
    animate() {
      requestAnimationFrame(this.animate)
      
      // Opcional: añadir rotación suave a la flor
      if (this.flowerGroup && this.flowerGroup.scale.x > 0) {
        this.flowerGroup.rotation.y += 0.005
      }
      
      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>

<style scoped>
/* Estilos del componente (scoped significa que solo aplican a este componente) */

.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.three-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Permite clics a través del overlay */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.water-button {
  pointer-events: all; /* Permite clics en el botón */
  background: linear-gradient(145deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  position: relative;
  top: -100px; /* Mover hacia arriba desde el centro */
}

.water-button:hover:not(:disabled) {
  background: linear-gradient(145deg, #5CBF60, #4CAF50);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.water-button:disabled {
  background: linear-gradient(145deg, #cccccc, #999999);
  cursor: not-allowed;
  transform: none;
}

.water-button.growing {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.love-message {
  pointer-events: none;
  background: rgba(255, 182, 193, 0.9);
  color: #8B008B;
  padding: 15px 25px;
  border-radius: 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(20px) scale(0.8);
  transition: all 0.5s ease;
  position: relative;
  top: 50px; /* Mover hacia abajo desde el centro */
}

.love-message.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.love-message::before {
  content: '🌸';
  margin-right: 10px;
}

.love-message::after {
  content: '🌸';
  margin-left: 10px;
}
</style>