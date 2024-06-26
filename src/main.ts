import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import Stats from 'three/addons/libs/stats.module.js'
// import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'

const scene = new THREE.Scene()

const light = new THREE.SpotLight(undefined, Math.PI * 1000)
light.position.set(5, 5, 5)
// light.angle = Math.PI / 16
light.castShadow = true
scene.add(light)

const data = { color: 0x00ff00, lightColor: 0xffffff }

const ambientLight = new THREE.AmbientLight(data.lightColor, Math.PI)
// ambientLight.visible = false
scene.add(ambientLight)

// new RGBELoader().load('img/venice_sunset_1k.hdr', (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping
//   scene.environment = texture
// })

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(1.5, 0.75, 2)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.1
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true


new GLTFLoader().load('models/computer2.glb', (gltf) => {
  console.log(gltf)

  scene.add(gltf.scene)
})

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  renderer.render(scene, camera)

  stats.update()
}

animate()