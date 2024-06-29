import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js'


// Klasicna scena u Three.js
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xf4f1de)

// Glavna kamera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 17
camera.position.y = 7

// Klasican renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

let gameIsActive = true

// OrbitControls za debuging, kad je odkomentarisano mozes da se kreces po sceni uz pomoc misa
// new OrbitControls(camera, renderer.domElement)


// Prazan Object3D objekat, koristi se da bi sve platforme na koje lopta pada
// bile u jednom objektu kako bi lakse mogle da se pomeraju levo desno pointerom
const obstaclesGroup = new THREE.Group()
scene.add(obstaclesGroup)

// Lista u kojoj se pamte sve platforme kako bi se njima lakse manipulisalo
let obstaclesList:{mesh: THREE.Mesh, collider: THREE.Box3}[]  = []

// Inicilano postavljanje geometrije i materijala za platforme
const obstacleGeometry = new THREE.BoxGeometry(5, 0.5, 5)
const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x1A2130})

// ==================================================================

// U game developmentu cesto objekte koji su predstavljeni na sceni delimo
// na vizualnu i fizicku reprezentaciju objekta
// ove dve reprezentacije cesto se nazivaju: Mesh (ili sprite ako je 2D igra)
// i Collider. Mesh je vizualni deo, ono sto vidimo na ekranu
// Collider je fizick deo, ono sto se koristi kako bi se detektovali dodiri saobjektima
// manipulisalo objektom uz pomoc simulacije fizike i slicno

// ==================================================================

// Postavljanje prve platforme

// Kreiranje vizualnog dela 3D platforme
const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial)

// Kreiranje fizickog dela 3D plaftorme, ovaj "collider" je zapravo
// fizicka reprezentacija platforme i pomocu njega se detektuje da li
// je lopta u dodiru sa platformom
const collider = new THREE.Box3().setFromObject(obstacle)

// "Mesh" platforme ze dodaje u grupu
obstaclesGroup.add(obstacle)

// "Mesh" i "Collider" platforme se dodaju u listu koja ih sve pamti
obstaclesList.push({mesh: obstacle, collider: collider})

// =================================================================

//For petlja kreira 5 narednih platformi
for(let i = 0; i < 5; i++ ) {

  // Standardno kreiranje Mesh-a
  const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial)
  // Svaka sledeca patforma postavlja se 15 jedinica dalje po z osi
  obstacle.position.z = -(i * 15) - 15

  // Svakoj novoj platformi dodaje se random pozicija po x osi
  obstacle.position.x = getRandomFloat(-10, 10)

  // Kreiranje collidera nove platforme
  const collider = new THREE.Box3().setFromObject(obstacle)


  // Dodavanje nove platforme u grupu i array
  obstaclesGroup.add(obstacle)
  obstaclesList.push({mesh: obstacle, collider: collider})
}

// Promenljiva koja cuva z poziciju sledece platforme koja ce biti dodata na scenu
let obstaclePositionZOffset = -90

// Kreiranje geometrije i materijala za loptu
const ballGeometry = new THREE.SphereGeometry(0.7)
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xE07A5F })

// Standardno dodavanje lopte na scenu
const ball = new THREE.Mesh(ballGeometry, ballMaterial)
ball.position.y = 5
scene.add(ball)

// Promenljive koje se koriste za simulaciju gravitacije koja utice na loptu
const gravity = -0.043
let ballVelocity = 0

// Promenljiva koja prati da li lopta treba da krene ka sledecoj platformi
let targetBallZPosition = 0

// Collider lopte.
// Iako je Mesh lopte zapravo okrugao, ponovo se koristi box za fizicko telo
// zbog jednostavnost, u ovom primeru igre nema komplikovane simulacije fizike
// koju bi ova razlika poremetila.

// Kod komplikovanijih 3D modela jako cesto se koriste uprosceniji Collideri
// zbog ustede resursa na racunaru. Potrebno je izvesti puno matematickih proracuna
// u toku simulacije fizike
const ballBoundingBox = new THREE.Box3().setFromObject(ball)


// Promenljive koje vode racuna i inputima
// koristice se za glavnu kontrolu igre
let pointerisDown = false
let previousMousePosition = {
  x: 0,
  y: 0
}

// Standardni OnPointerDown event, vodi racuna o tome da li je pointer pritisnut na ekranu
function onPointerDown(event: MouseEvent | TouchEvent) {
  pointerisDown = true
  previousMousePosition.x = (event as MouseEvent).clientX || (event as TouchEvent).touches[0].clientX

  if(!gameIsActive) {
    window.location.reload();
  }
}

// Standardni OnPointerDown event, sluzi za pomeranje platformi levo desno
function onPointerMove(event: MouseEvent | TouchEvent) {
  if (pointerisDown) {

    //uzima inicijalnu poziciju x pointera
    const currentX = (event as MouseEvent).clientX || (event as TouchEvent).touches[0].clientX

    // razlika u poziciji pri pomeranju
    const deltaX = currentX - previousMousePosition.x

    //Azurira poziciju platformi u skladu sa pomeranjem pointera
    obstaclesGroup.position.x += deltaX * 0.1

    //postavlja novu inicijalnu tacku pointera
    previousMousePosition.x = currentX

  }
}

// Standardni OnPointerUp event, vodi racuna o tome da li je pointer pritisnut na ekranu
function onPointerUp() {
  pointerisDown = false
}

window.addEventListener('mousedown', onPointerDown)
window.addEventListener('touchstart', onPointerDown, { passive: false })
window.addEventListener('mousemove', onPointerMove)
window.addEventListener('touchmove', onPointerMove, { passive: false })
window.addEventListener('mouseup', onPointerUp)
window.addEventListener('touchend', onPointerUp)

//Funkcija koja se koristi da u svakom frejmu azurira fizicje reprezentacije (Collider)
// objektata u odnosu na njihove vizualne reprezentacije (Mesh)
function updateBoundingBoxes() {
  ballBoundingBox.setFromObject(ball)
  for(const {mesh, collider} of obstaclesList) {
    collider.setFromObject(mesh)
  }
}

//Shiftuje platforme nakon sto se prva u nizu preskoci
function shiftObstacleList() {
  for (let i = 0; i < obstaclesList.length ; i++) {
    obstaclesList[i] = obstaclesList[i + 1];
  }
  spawnNewObstacle()
  obstaclePositionZOffset -= 15
}

// Dodaje novu platformu na najnizu z poziciju i postavlja je kao
// poslednji element  u nizu
function spawnNewObstacle() {
  const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial)
  obstacle.position.z = obstaclePositionZOffset
  obstacle.position.x = getRandomFloat(-10, 10)
  const collider = new THREE.Box3().setFromObject(obstacle)
  obstaclesGroup.add(obstacle)
  obstaclesList[5] = {mesh: obstacle, collider: collider}
}

// Ovde se desava glavna logika koja proverava dodirivanje objekata
// zbog ustede resursa proverava iskljucivo da li lopta dodiruje
// prvu platformu u nizu jer je zbog toka igre fizicki samo to
// i moguce
function checkCollisions() {
  updateBoundingBoxes()
  // intersectsBox metoda Box3 klase Three/js biblioteke proverava da li
  // dati Box3 objekat ulazi u prostor (dodiruje) drugom Box3 objektu
  // koji je zadat kao parametar metode
  if(ballBoundingBox.intersectsBox(obstaclesList[0].collider)) {
    // Ako dodje do dodira postavilja brzinu lopte na pozotovnu vrednost
    // kako bi se simuliralo odbijanje/odskakanje
    ballVelocity = 0.7
    console.log("Bounce!")

      // Ako je pointer pritisnut na ekran lopta odskace do sledece platforme
      // shiftuju se platforme i doaje se poen
      if(pointerisDown) {
        console.log("MoveForward!")
        targetBallZPosition = obstaclesList[1].mesh.position.z
        shiftObstacleList()
        updateScore()
      }
  }

}


// Pomera loptu u napred ako su postignuti uslovi za skakanje na sledecu platformu 
// Funkcija takodje pomera i kameru kako bi ona pratila z poziciju polte
function moveBallFowrard() {
  if(ball.position.z > targetBallZPosition) {
    ball.position.z -= 0.5
    camera.position.z -= 0.5
  }
}

// Promenljiva koja prati skor igre
let score = 0

// Jednostavna funkcija za prikazivanje skora
function updateScore() {
  score += 1
  document.getElementById('score')!.innerText = `Score: ${score}`
}

// Funkcija resetuje igru ako lopta padne ispod platformi
// odnosno ako igrac promasi platforme
function pauseIfBallBelowThreshold() {
  if (ball.position.y < -5) {
    ballVelocity = 30
    gameIsActive = false
  }
}

// ======================================================

// Kako su video igre interaktivan sadrzaj cesto je potrebno konstantno menjati
// ono sto se porikazuje na ekranu.
// Zato svaki game engine ima neku vrstu update funkcije koja se poziva u svakom 
// frejmu i vodi racuna o tome da svet igre adekvatno raguje na input igraca

// Three.js projekti cesto imaju slicnu funkciju koju po nekoj konvenciji nazivaju animate
// ova funkcija se korsti vrlo slicno kao i u igrama. za animiranje, pomeranje, rotitranje objekata
// i reakciju Three.js scene na input korisnika.

// Sa ovim u vidu animate finkcija u slucaju ovog projekata u svakom frejmu radi sledece:

function animate() {
  if ( !gameIsActive) return

  requestAnimationFrame(animate)

  // Simulira ubrzanje gravitacije i tu gravitaciju primenjuje na lopti
  ballVelocity += gravity
  ball.position.y += ballVelocity

  // Pomera loptu u napred ako za to postoji uslov
  moveBallFowrard()

  // Proverava da li je doslo dod dodirivanja lopte i platforme
  // i reaguje u skladu sa kodom
  checkCollisions()

  // Proverava da li su platforme promasene
  // i reaguje u skladu sa kodom
  pauseIfBallBelowThreshold()

  // Iscrtava reprezentaciju 3D scene po canvasu
  renderer.render(scene, camera)
}

animate()


// ======================================================

// Helper funkcija koja vraca random float broj izmedju zadatog minimuma i maksimuma
// U slucaju ovog projekta koristi se iskljucivo za postavljanje random pozicije nove platforme
// U igrama inace postoji potreba za RBG (Random Number Generator) koji generise
// pseudo random broj za razlicite potrebe
function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}