<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement>()
const messageVisible = ref(false)
const showClickHint = ref(true)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number

let earthMound: THREE.Mesh
let flower: THREE.Group
let waterParticles: THREE.Points
let isAnimating = false

const createDirtTexture = () => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createRadialGradient(size * 0.5, size * 0.45, size * 0.1, size * 0.5, size * 0.5, size * 0.55)
  grad.addColorStop(0, '#7a4a1f')
  grad.addColorStop(1, '#4f2d13')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 450; i++) {
    const r = Math.random() * 2 + 0.5
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(20, 10, 5, ${Math.random() * 0.15 + 0.05})`
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

const createPetalMesh = () => {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(-0.18, 0.05, -0.22, 0.35, 0, 0.55)
  shape.bezierCurveTo(0.22, 0.35, 0.18, 0.05, 0, 0)

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.02,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    curveSegments: 32
  }
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  const material = new THREE.MeshLambertMaterial({ color: 0xFFD54F })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  return mesh
}

const createLeafMesh = () => {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(-0.14, 0.04, -0.16, 0.22, 0, 0.38)
  shape.bezierCurveTo(0.16, 0.22, 0.14, 0.04, 0, 0)

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.015,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    curveSegments: 24
  }
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  const material = new THREE.MeshLambertMaterial({ color: 0x2e8b57 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  return mesh
}

const initThreeJS = () => {
  if (!canvasRef.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0.3, 1.5, 2.4)
  camera.lookAt(0, 0.6, 0)

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.85)
  directionalLight.position.set(-6, 9, 0)
  directionalLight.target.position.set(0, 0.2, 0)
  scene.add(directionalLight.target)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  const cam = directionalLight.shadow.camera as THREE.OrthographicCamera
  cam.left = -4; cam.right = 4; cam.top = 4; cam.bottom = -4
  cam.near = 0.5; cam.far = 25
  directionalLight.shadow.bias = -0.0005
  scene.add(directionalLight)

  const groundGeometry = new THREE.PlaneGeometry(50, 50)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4a5d23 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.8
  ground.receiveShadow = true
  scene.add(ground)

  createEarthMound()

  createFlower()

  createWaterParticles()

  canvasRef.value.addEventListener('click', onCanvasClick)

  animate()
}

const createEarthMound = () => {
  const geometry = new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);

  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + z * z);

    const noiseFactor = y > 0.7 ? 0 : 0.03;
    const noise = (Math.random() - 0.5) * noiseFactor * (1 - Math.min(r / 0.8, 1));
    pos.setY(i, y + noise);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();

  const material = new THREE.MeshLambertMaterial({ color: 0x8b5a2b, map: createDirtTexture() });
  earthMound = new THREE.Mesh(geometry, material);
  earthMound.position.set(0, -0.4, 0);
  earthMound.castShadow = false;
  earthMound.receiveShadow = true;
  scene.add(earthMound);
}

const createFlower = () => {
  flower = new THREE.Group()

  const stemGeometry = new THREE.CylinderGeometry(0.035, 0.05, 0.9)
  const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 })
  const stem = new THREE.Mesh(stemGeometry, stemMaterial)
  stem.position.set(0, 0.2, -0.12)
  stem.castShadow = true
  stem.renderOrder = 0
  flower.add(stem)

  const centerGeometry = new THREE.SphereGeometry(0.12)
  const centerMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
  const center = new THREE.Mesh(centerGeometry, centerMaterial)
  center.position.set(0, 0.95, 0.08)
  center.castShadow = true
  center.renderOrder = 3
  flower.add(center)

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const ringRadius = 0.06
    const group = new THREE.Group()
    group.position.set(0, 0.95, 0.06)
    group.rotation.z = angle

    const petal = createPetalMesh()
    petal.scale.set(0.82, 0.82, 1)
    petal.position.set(0, ringRadius, 0)
    petal.rotation.x = -Math.PI / 16
    group.add(petal)
    group.renderOrder = 2
    flower.add(group)
  }

  const leftLeafGroup = new THREE.Group()
  const leftLeaf = createLeafMesh()
  leftLeaf.position.set(0, -0.03, -0.012)
  leftLeaf.rotation.x = -Math.PI / 14
  leftLeafGroup.add(leftLeaf)
  leftLeafGroup.position.set(-0.06, 0.30, 0)
  leftLeafGroup.rotation.z = Math.PI * 0.6
  flower.add(leftLeafGroup)

  const rightLeafGroup = new THREE.Group()
  const rightLeaf = createLeafMesh()
  rightLeaf.position.set(0.06, 0, -0.012)
  rightLeaf.rotation.x = -Math.PI / 14
  rightLeafGroup.add(rightLeaf)
  rightLeafGroup.position.set(0.06, 0.30, 0)
  rightLeafGroup.rotation.z = -Math.PI * 0.6
  flower.add(rightLeafGroup)

  flower.position.set(0, 0.42, 0)
  flower.scale.set(0, 0, 0)
  flower.castShadow = true
  scene.add(flower)
}

const createWaterParticles = () => {
  const particleCount = 100
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 1.2
    positions[i + 1] = Math.random() * 1.5 + 0.8
    positions[i + 2] = (Math.random() - 0.5) * 1.2

    velocities[i] = (Math.random() - 0.5) * 0.02
    velocities[i + 1] = -Math.random() * 0.05 - 0.02
    velocities[i + 2] = (Math.random() - 0.5) * 0.02
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

  const material = new THREE.PointsMaterial({
    color: 0x4169E1,
    size: 0.025,
    transparent: true,
    opacity: 0.8,
    map: (() => {
      const size = 64
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      return new THREE.CanvasTexture(canvas)
    })(),
    alphaTest: 0.5
  })

  waterParticles = new THREE.Points(geometry, material)
  waterParticles.visible = false
  scene.add(waterParticles)
}

const onCanvasClick = (_event: MouseEvent) => {
  if (isAnimating) return

  showClickHint.value = false
  isAnimating = true

  animateWatering()
}

const animateWatering = () => {
  waterParticles.visible = true

  let waterTime = 0
  const waterDuration = 2000

  const animateWater = () => {
    if (waterTime < waterDuration) {
      const positions = waterParticles.geometry.attributes.position.array as Float32Array
      const velocities = waterParticles.geometry.attributes.velocity.array as Float32Array

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        if (positions[i + 1] < -0.4) {
          positions[i] = (Math.random() - 0.5) * 1.2;
          positions[i + 1] = Math.random() * 1.5 + 0.8;
          positions[i + 2] = (Math.random() - 0.5) * 1.2;
        }
      }

      waterParticles.geometry.attributes.position.needsUpdate = true
      waterTime += 16
      requestAnimationFrame(animateWater)
    } else {
      waterParticles.visible = false
      growFlower()
    }
  }

  animateWater()
}

const growFlower = () => {
  const startScale = 0
  const endScale = 1
  const duration = 2000
  let startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    const easeProgress = 1 - Math.pow(1 - progress, 3)

    const currentScale = startScale + (endScale - startScale) * easeProgress
    flower.scale.set(currentScale, currentScale, currentScale)

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      messageVisible.value = true
      isAnimating = false
    }
  }

  animate()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  initThreeJS()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('click', onCanvasClick)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="garden-container">
    <canvas ref="canvasRef" class="garden-canvas"></canvas>

    <!-- Mensaje romántico -->
    <Transition name="message">
      <div v-if="messageVisible" class="romantic-message">
        <h1 class="message-text">Feliz primavera mi amor ❤️</h1>
        <div class="heart-animation">💐🌸🌻🌺</div>
      </div>
    </Transition>

    <!-- Indicación para hacer click -->
    <Transition name="hint">
      <div v-if="showClickHint" class="click-hint">
        <p>Haz click en el montículo para regar la tierra</p>
        <div class="hint-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.garden-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Georgia', serif;
}

.garden-canvas {
  display: block;
  cursor: pointer;
}

.romantic-message {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  padding: 1rem 2rem;
}

.message-text {
  font-size: 2.5rem;
  color: #ffffff;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-weight: 300;
}

.heart-animation {
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

.click-hint {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  color: #2c5e2e;
  font-size: 1.1rem;
  animation: pulse 2s infinite;
}

.hint-arrow {
  font-size: 1.5rem;
  animation: bounce 1s infinite;
  color: #4a7c59;
}

/* Transiciones */
.message-enter-active {
  transition: all 0.8s ease-out;
}

.message-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.hint-enter-active,
.hint-leave-active {
  transition: all 0.5s ease;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Animaciones */
@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }

  50% {
    transform: translateX(-50%) scale(1.05);
  }
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .message-text {
    font-size: 1.8rem;
  }

  .romantic-message {
    padding: 1.5rem 2rem;
    margin: 0 1rem;
  }

  .click-hint {
    font-size: 1rem;
    padding: 0.8rem 1.2rem;
    margin: 0 1rem;
  }
}

@media (max-width: 480px) {
  .message-text {
    font-size: 1.4rem;
  }

  .heart-animation {
    font-size: 1.5rem;
  }
}
</style>