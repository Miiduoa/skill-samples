import * as THREE from 'three'
import { createCampus } from './campus.js'
import { createCameraRig } from './cameraRig.js'
import { resolveCollision } from './collision.js'
import { PLAYER_RADIUS, PLAYER_SPEED } from './config.js'
import { createDemo } from './demo.js'
import { createLighting, createSky, waitForFonts } from './gfx.js'
import { createInput } from './input.js'
import { createStudent } from './student.js'

await waitForFonts()

const canvas = document.getElementById('c')
const isMobile = window.innerWidth < 720 || navigator.maxTouchPoints > 0

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: true,
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.6))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.22
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
scene.background = new THREE.Color('#c49a78')
scene.add(createSky())
createLighting(scene)

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.12,
  280,
)

const campus = createCampus(scene)
const player = createStudent()
scene.add(player.root)

const input = createInput(canvas)
const cameraRig = createCameraRig(camera)
cameraRig.snapFollow(player, input.look)
const demo = createDemo(player, cameraRig)

const clock = new THREE.Clock()
const forward = new THREE.Vector3()

document.getElementById('aerial-btn')?.addEventListener('click', () => {
  if (demo.playing) demo.stop()
  cameraRig.toggle()
})

function onResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}
window.addEventListener('resize', onResize)

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05)
  let moving = false

  if (demo.playing) {
    demo.update()
  } else if (!cameraRig.isAerial()) {
    const mv = input.getMove()
    if (mv.moving) {
      const yaw = player.root.rotation.y + input.look.x
      forward.set(Math.sin(yaw), 0, Math.cos(yaw))
      const right = new THREE.Vector3(forward.z, 0, -forward.x)
      const dx = (forward.x * -mv.z + right.x * mv.x) * PLAYER_SPEED * dt
      const dz = (forward.z * -mv.z + right.z * mv.x) * PLAYER_SPEED * dt
      const next = resolveCollision(
        player.root.position.x + dx,
        player.root.position.z + dz,
        PLAYER_RADIUS,
        campus.colliders,
      )
      if (Math.hypot(dx, dz) > 0.0001) {
        player.root.rotation.y = Math.atan2(next.x - player.root.position.x, next.z - player.root.position.z)
      }
      player.root.position.x = next.x
      player.root.position.z = next.z
      moving = true
    }
    player.update(dt, moving)
  } else {
    player.update(dt, false)
  }

  cameraRig.update(dt, player, input.look, { freezeOrbit: demo.playing })
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

requestAnimationFrame(tick)

function waitFrames(n) {
  return new Promise((resolve) => {
    let i = 0
    const step = () => {
      i++
      renderer.render(scene, camera)
      if (i >= n) resolve()
      else requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

window.__ready = true
window.__playDemo = () => {
  cameraRig.lock(false)
  demo.play()
}
window.__seekDemo = (t) => {
  demo.seek(t)
  demo.update()
}
window.__stopDemo = () => demo.stop()
window.__hideUI = () => document.body.classList.add('capture-ui-off')
window.__showUI = () => document.body.classList.remove('capture-ui-off')
window.__shot = async (name) => {
  demo.stop()
  cameraRig.lock(true)
  cameraRig.placeShot(name, player)
  await waitFrames(5)
}
window.__unlockCamera = () => cameraRig.lock(false)
window.__setPlayer = (x, z, yaw) => {
  player.root.position.set(x, 0, z)
  if (yaw != null) player.root.rotation.y = yaw
}
window.__info = () => ({
  pos: player.root.position.toArray(),
  aerial: cameraRig.isAerial(),
})

const params = new URLSearchParams(location.search)
if (params.get('demo') === '1') {
  window.__hideUI()
  setTimeout(() => demo.play(), 400)
}
if (params.get('ui') === '0') window.__hideUI()
