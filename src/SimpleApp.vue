<!-- SimpleApp.vue - Versión simplificada con Canvas 2D -->
<template>
  <div class="app-container">
    <!-- Canvas para dibujar el montículo y la flor -->
    <canvas 
      ref="canvas" 
      class="main-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
    
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
export default {
  name: 'SimpleApp',
  data() {
    return {
      // Variables para controlar el estado de la aplicación
      isGrowing: false,     // Estado del crecimiento de la flor
      showMessage: false,   // Mostrar mensaje de amor
      messageVisible: false, // Animación del mensaje
      
      // Canvas variables
      ctx: null,            // Contexto del canvas
      canvasWidth: 0,       // Ancho del canvas
      canvasHeight: 0,      // Alto del canvas
      
      // Animación de la flor
      flowerSize: 0,        // Tamaño actual de la flor (0-1)
      animationFrame: null, // Frame de animación
    }
  },
  
  mounted() {
    this.initCanvas()
    this.drawScene()
    
    // Manejar redimensionamiento
    window.addEventListener('resize', this.handleResize)
  },
  
  beforeUnmount() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    window.removeEventListener('resize', this.handleResize)
  },
  
  methods: {
    // Inicializar el canvas
    initCanvas() {
      this.handleResize()
      this.ctx = this.$refs.canvas.getContext('2d')
    },
    
    // Manejar redimensionamiento de ventana
    handleResize() {
      this.canvasWidth = window.innerWidth
      this.canvasHeight = window.innerHeight
      this.$nextTick(() => {
        this.drawScene()
      })
    },
    
    // Dibujar la escena completa
    drawScene() {
      if (!this.ctx) return
      
      // Limpiar canvas
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      
      // Dibujar el montículo de tierra
      this.drawDirtMound()
      
      // Dibujar la flor si está creciendo o ya creció
      if (this.flowerSize > 0) {
        this.drawFlower()
      }
    },
    
    // Dibujar el montículo de tierra
    drawDirtMound() {
      const ctx = this.ctx
      const centerX = this.canvasWidth / 2
      const bottomY = this.canvasHeight
      const moundHeight = this.canvasHeight / 4 // Ocupa 1/4 de la pantalla
      const moundWidth = this.canvasWidth * 0.6
      
      // Crear gradiente para el montículo
      const gradient = ctx.createRadialGradient(
        centerX, bottomY - moundHeight/2, 0,
        centerX, bottomY - moundHeight/2, moundWidth/2
      )
      gradient.addColorStop(0, '#8B4513') // Marrón claro en el centro
      gradient.addColorStop(1, '#654321') // Marrón oscuro en los bordes
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      
      // Dibujar una forma de montículo (elipse en la parte inferior)
      ctx.ellipse(
        centerX, 
        bottomY - moundHeight/4, 
        moundWidth/2, 
        moundHeight/2, 
        0, 0, Math.PI
      )
      ctx.fill()
      
      // Añadir textura con pequeños círculos
      ctx.fillStyle = '#654321'
      for (let i = 0; i < 20; i++) {
        const x = centerX + (Math.random() - 0.5) * moundWidth * 0.8
        const y = bottomY - moundHeight/4 + (Math.random() - 0.5) * moundHeight * 0.3
        ctx.beginPath()
        ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    
    // Dibujar la flor amarilla
    drawFlower() {
      const ctx = this.ctx
      const centerX = this.canvasWidth / 2
      const moundTop = this.canvasHeight - this.canvasHeight / 4
      const flowerScale = this.flowerSize
      
      if (flowerScale <= 0) return
      
      // Calcular alturas basadas en el crecimiento
      const stemHeight = 80 * flowerScale
      const flowerY = moundTop - stemHeight
      
      // Dibujar el tallo
      ctx.strokeStyle = '#228B22'
      ctx.lineWidth = 8 * flowerScale
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(centerX, moundTop)
      ctx.lineTo(centerX, flowerY)
      ctx.stroke()
      
      // Dibujar hojas
      const leafSize = 15 * flowerScale
      ctx.fillStyle = '#32CD32'
      
      // Hoja izquierda
      ctx.beginPath()
      ctx.ellipse(centerX - 20 * flowerScale, flowerY + 20 * flowerScale, leafSize, leafSize/2, -Math.PI/4, 0, Math.PI * 2)
      ctx.fill()
      
      // Hoja derecha
      ctx.beginPath()
      ctx.ellipse(centerX + 20 * flowerScale, flowerY + 30 * flowerScale, leafSize, leafSize/2, Math.PI/4, 0, Math.PI * 2)
      ctx.fill()
      
      // Dibujar pétalos amarillos
      const petalSize = 25 * flowerScale
      const petalCount = 8
      
      ctx.fillStyle = '#FFD700' // Amarillo dorado
      
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2
        const petalX = centerX + Math.cos(angle) * (petalSize * 0.8)
        const petalY = flowerY + Math.sin(angle) * (petalSize * 0.8)
        
        ctx.save()
        ctx.translate(petalX, petalY)
        ctx.rotate(angle + Math.PI/2)
        
        ctx.beginPath()
        ctx.ellipse(0, 0, petalSize/2, petalSize, 0, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      }
      
      // Dibujar el centro de la flor
      ctx.fillStyle = '#FF8C00' // Naranja
      ctx.beginPath()
      ctx.arc(centerX, flowerY, 15 * flowerScale, 0, Math.PI * 2)
      ctx.fill()
      
      // Añadir pequeños detalles al centro
      ctx.fillStyle = '#FF6347'
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const dotX = centerX + Math.cos(angle) * (8 * flowerScale)
        const dotY = flowerY + Math.sin(angle) * (8 * flowerScale)
        ctx.beginPath()
        ctx.arc(dotX, dotY, 2 * flowerScale, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    
    // Función que se ejecuta cuando se hace clic en "Regar"
    async waterFlower() {
      if (this.isGrowing) return
      
      this.isGrowing = true
      
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
        
        const animate = () => {
          const elapsedTime = Date.now() - startTime
          const progress = Math.min(elapsedTime / duration, 1)
          
          // Función de easing para una animación más suave
          const easeProgress = 1 - Math.pow(1 - progress, 3)
          
          this.flowerSize = easeProgress
          this.drawScene()
          
          if (progress < 1) {
            this.animationFrame = requestAnimationFrame(animate)
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
    }
  }
}
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%);
}

.main-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.water-button {
  pointer-events: all;
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
  top: -100px;
  z-index: 10;
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
  top: 50px;
  z-index: 10;
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