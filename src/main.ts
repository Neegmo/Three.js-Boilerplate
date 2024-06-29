import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// function getRandomInteger(min: number, max: number) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xf4f1de)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 17
camera.position.y = 7

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// new OrbitControls(camera, renderer.domElement)

const obstaclesGroup = new THREE.Group()
scene.add(obstaclesGroup)

let obstaclesList:{mesh: THREE.Mesh, collider: THREE.Box3}[]  = []

const obstacleGeometry = new THREE.BoxGeometry(5, 0.5, 5)
const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x1A2130})

const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial)
const collider = new THREE.Box3().setFromObject(obstacle)
obstaclesGroup.add(obstacle)
obstaclesList.push({mesh: obstacle, collider: collider})

for(let i = 0; i < 5; i++ ) {
  const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial)
  obstacle.position.z = -(i * 15) - 15
  obstacle.position.x = getRandomFloat(-10, 10)

  const collider = new THREE.Box3().setFromObject(obstacle)

  obstaclesGroup.add(obstacle)
  obstaclesList.push({mesh: obstacle, collider: collider})
}

let obstaclePositionZOffset = -90


const ballGeometry = new THREE.SphereGeometry(0.7)
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xE07A5F })

const ball = new THREE.Mesh(ballGeometry, ballMaterial)
// ball.position.z = -10
ball.position.y = 5
scene.add(ball)


const gravity = -0.043
let ballVelocity = 0

let targetBallZPosition = 0

let pointerisDown = false
let previousMousePosition = {
  x: 0,
  y: 0
}

function onPointerDown(event: MouseEvent | TouchEvent) {
  pointerisDown = true
  previousMousePosition.x = (event as MouseEvent).clientX || (event as TouchEvent).touches[0].clientX
}

function onPointerMove(event: MouseEvent | TouchEvent) {
  if (pointerisDown) {
    const currentX = (event as MouseEvent).clientX || (event as TouchEvent).touches[0].clientX

    const deltaX = currentX - previousMousePosition.x

    obstaclesGroup.position.x += deltaX * 0.03

    previousMousePosition.x = currentX

  }
}

function onPointerUp(event: MouseEvent | TouchEvent) {
  pointerisDown = false
}

window.addEventListener('mousedown', onPointerDown)
window.addEventListener('touchstart', onPointerDown, { passive: false })
window.addEventListener('mousemove', onPointerMove)
window.addEventListener('touchmove', onPointerMove, { passive: false })
window.addEventListener('mouseup', onPointerUp)
window.addEventListener('touchend', onPointerUp)

const ballBoundingBox = new THREE.Box3().setFromObject(ball)

function updateBoundingBoxes() {
  ballBoundingBox.setFromObject(ball)
  for(const {mesh, collider} of obstaclesList) {
    collider.setFromObject(mesh)
  }
}

function shiftObstacleList() {
  for (let i = 0; i < obstaclesList.length ; i++) {
    obstaclesList[i] = obstaclesList[i + 1];
  }
  spawnNewObstacle()
  obstaclePositionZOffset -= 15
}

function spawnNewObstacle() {
  const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial)
  obstacle.position.z = obstaclePositionZOffset
  obstacle.position.x = getRandomFloat(-10, 10)
  const collider = new THREE.Box3().setFromObject(obstacle)
  obstaclesGroup.add(obstacle)
  obstaclesList[5] = {mesh: obstacle, collider: collider}
}

function checkCollisions() {
  updateBoundingBoxes()

  if(ballBoundingBox.intersectsBox(obstaclesList[0].collider)) {
    ballVelocity = 0.7
    console.log("Bounce!")
      if(pointerisDown) {
        console.log("MoveForward!")
        targetBallZPosition = obstaclesList[1].mesh.position.z
        shiftObstacleList()
        updateScore()
      }
  }

}

function moveBallFowrard() {
  if(ball.position.z > targetBallZPosition) {
    ball.position.z -= 0.5
    camera.position.z -= 0.5
  }
}

let score = 0

function updateScore() {
  score += 1
  document.getElementById('score')!.innerText = `Score: ${score}`
}

function reloadIfBallBelowThreshold() {
  if (ball.position.y < -5) {
    ballVelocity = 30
    window.location.reload();
  }
}

function animate() {
  requestAnimationFrame(animate)

  ballVelocity += gravity
  ball.position.y += ballVelocity
  moveBallFowrard()

  checkCollisions()
  reloadIfBallBelowThreshold()

  renderer.render(scene, camera)
}

animate()
