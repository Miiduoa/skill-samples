import * as THREE from 'three'
import { AERIAL, WALK_WAYPOINTS } from './config.js'

export function createDemo(player, cameraRig) {
  const curve = new THREE.CatmullRomCurve3(
    WALK_WAYPOINTS.map(([x, z]) => new THREE.Vector3(x, 0, z)),
  )
  const tmp = new THREE.Vector3()
  const look = new THREE.Vector3()
  let playing = false
  let t0 = 0
  let forcedTime = null
  let didSnapWalk = false
  const aerialSec = 8
  const walkSec = 10
  const total = aerialSec + walkSec

  function placeAt(t) {
    if (t >= total) {
      stop()
      return { moving: false, done: true }
    }
    if (t < aerialSec) {
      cameraRig.setAerial(true)
      cameraRig.aerialT = 0.15 + t * AERIAL.speed
      player.update(0.016, false)
      didSnapWalk = false
      return { moving: false, t, mode: 'aerial' }
    }
    cameraRig.setAerial(false)
    const u = Math.min(1, (t - aerialSec) / walkSec)
    const eased = u * u * (3 - 2 * u)
    curve.getPoint(eased, tmp)
    curve.getPoint(Math.min(1, eased + 0.02), look)
    player.root.position.set(tmp.x, 0, tmp.z)
    player.root.rotation.y = Math.atan2(look.x - tmp.x, look.z - tmp.z)
    player.update(0.016, true)
    if (!didSnapWalk) {
      cameraRig.snapFollow(player)
      didSnapWalk = true
    }
    return { moving: true, t, mode: 'walk' }
  }

  function play() {
    playing = true
    forcedTime = null
    t0 = performance.now()
    didSnapWalk = false
    const p = curve.getPoint(0)
    player.root.position.set(p.x, 0, p.z)
    player.root.rotation.y = Math.PI
    placeAt(0)
  }

  function seek(seconds) {
    playing = true
    forcedTime = seconds
    didSnapWalk = seconds >= aerialSec
    placeAt(seconds)
  }

  function stop() {
    playing = false
    forcedTime = null
    cameraRig.setAerial(false)
    player.update(0.016, false)
  }

  function update() {
    if (!playing) return { moving: false }
    const t = forcedTime == null ? (performance.now() - t0) / 1000 : forcedTime
    return placeAt(t)
  }

  return { play, stop, seek, update, get playing() { return playing } }
}
