import * as THREE from 'three'
import { AERIAL } from './config.js'

export function createCameraRig(camera) {
  const followOffset = new THREE.Vector3(0, 4.8, 8.4)
  const lookTarget = new THREE.Vector3()
  const desired = new THREE.Vector3()
  let aerial = false
  let aerialT = 0.35
  let locked = false
  const aerialLook = new THREE.Vector3(...AERIAL.target)

  function setAerial(on) {
    aerial = on
    const btn = document.getElementById('aerial-btn')
    if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false')
  }

  function toggle() {
    setAerial(!aerial)
  }

  function isAerial() {
    return aerial
  }

  function lock(on) {
    locked = on
  }

  function update(dt, player, look, opts = {}) {
    if (locked) return
    if (aerial) {
      if (!opts.freezeOrbit) aerialT += dt * AERIAL.speed
      const a = aerialT
      camera.position.set(
        Math.cos(a) * AERIAL.radius,
        AERIAL.height,
        6 + Math.sin(a) * AERIAL.radius * 0.85,
      )
      camera.lookAt(aerialLook)
      return
    }
    const yaw = player.root.rotation.y + look.x
    desired.set(
      player.root.position.x + Math.sin(yaw) * followOffset.z,
      followOffset.y + look.y * 6,
      player.root.position.z + Math.cos(yaw) * followOffset.z,
    )
    camera.position.lerp(desired, 1 - Math.pow(0.001, dt))
    lookTarget.set(
      player.root.position.x,
      1.45,
      player.root.position.z,
    )
    camera.lookAt(lookTarget)
  }

  function snapFollow(player, look = { x: 0, y: 0 }) {
    const yaw = player.root.rotation.y + look.x
    camera.position.set(
      player.root.position.x + Math.sin(yaw) * followOffset.z,
      followOffset.y,
      player.root.position.z + Math.cos(yaw) * followOffset.z,
    )
    camera.lookAt(player.root.position.x, 1.45, player.root.position.z)
  }

  const pondLook = new THREE.Vector3(13.2, 0.8, 11.4)

  function placeShot(name, player) {
    setAerial(false)
    const shots = {
      aerial: () => {
        camera.position.set(-2, 30, -26)
        camera.lookAt(1, 0.6, 6)
      },
      gate: () => {
        camera.position.set(0.15, 1.85, -11.8)
        camera.lookAt(0, 4.8, 0.6)
      },
      pond: () => {
        camera.position.set(20.4, 1.55, 15.6)
        camera.lookAt(6.5, 1.4, 5.5)
      },
      bus: () => {
        camera.position.set(6.6, 3.35, -9.2)
        camera.lookAt(15.4, 1.55, -17.4)
      },
    }
    ;(shots[name] || shots.aerial)()
    if (name === 'follow') snapFollow(player)
  }

  return {
    update,
    toggle,
    setAerial,
    isAerial,
    snapFollow,
    placeShot,
    lock,
    get aerialT() {
      return aerialT
    },
    set aerialT(v) {
      aerialT = v
    },
  }
}
