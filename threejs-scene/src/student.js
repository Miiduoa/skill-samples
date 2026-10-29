import * as THREE from 'three'
import { PLAYER_START } from './config.js'
import { lambert, makeFaceTex, standard } from './gfx.js'

export function createStudent() {
  const root = new THREE.Group()
  root.name = 'student'
  root.position.set(PLAYER_START.x, 0, PLAYER_START.z)
  root.rotation.y = PLAYER_START.yaw

  const skin = standard(0xe8c4a4, { roughness: 0.65 })
  const shirt = lambert(0xf4f0e6)
  const pants = lambert(0x2c3340)
  const hair = lambert(0x1c1410)
  const bag = lambert(0x2a3a58)

  const hips = new THREE.Group()
  hips.position.y = 0.92
  root.add(hips)

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.54, 0.28), shirt)
  torso.position.y = 0.42
  torso.castShadow = true
  hips.add(torso)
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.18), shirt)
  collar.position.y = 0.7
  hips.add(collar)

  const head = new THREE.Group()
  head.position.y = 0.82
  const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.32), skin)
  cranium.castShadow = true
  head.add(cranium)

  const faceNeutral = makeFaceTex(false)
  const faceSmile = makeFaceTex(true)
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshLambertMaterial({ map: faceNeutral }),
  )
  face.position.set(0, 0.01, 0.165)
  head.add(face)

  const haircap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.34), hair)
  haircap.position.set(0, 0.16, -0.01)
  head.add(haircap)
  const bang = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.08), hair)
  bang.position.set(0, 0.12, 0.14)
  head.add(bang)
  hips.add(head)

  const mkLimb = (geo, mat, y) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.y = y
    m.castShadow = true
    const wrap = new THREE.Group()
    wrap.add(m)
    return wrap
  }

  const lArm = mkLimb(new THREE.BoxGeometry(0.12, 0.46, 0.12), skin, -0.2)
  lArm.position.set(-0.29, 0.58, 0)
  const rArm = mkLimb(new THREE.BoxGeometry(0.12, 0.46, 0.12), skin, -0.2)
  rArm.position.set(0.29, 0.58, 0)
  const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.16), shirt)
  lSleeve.position.set(-0.29, 0.62, 0)
  const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.16), shirt)
  rSleeve.position.set(0.29, 0.62, 0)
  hips.add(lArm, rArm, lSleeve, rSleeve)

  const lLeg = mkLimb(new THREE.BoxGeometry(0.14, 0.52, 0.16), pants, -0.26)
  lLeg.position.set(-0.12, 0, 0)
  const rLeg = mkLimb(new THREE.BoxGeometry(0.14, 0.52, 0.16), pants, -0.26)
  rLeg.position.set(0.12, 0, 0)
  const shoeMat = lambert(0xf2eee6)
  const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.26), shoeMat)
  lShoe.position.set(0, -0.56, 0.04)
  lLeg.add(lShoe)
  const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.26), shoeMat)
  rShoe.position.set(0, -0.56, 0.04)
  rLeg.add(rShoe)
  hips.add(lLeg, rLeg)

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.18), bag)
  pack.position.set(0, 1.32, -0.24)
  pack.castShadow = true
  root.add(pack)
  const flap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.2), lambert(0x24324c))
  flap.position.set(0, 1.5, -0.24)
  root.add(flap)

  const state = { smiling: false, phase: 0, moving: false }

  function setSmile(on) {
    if (on === state.smiling) return
    state.smiling = on
    face.material.map = on ? faceSmile : faceNeutral
    face.material.needsUpdate = true
  }

  function update(dt, moving) {
    state.moving = moving
    setSmile(moving)
    if (moving) state.phase += dt * 10
    else state.phase *= 0.85
    const s = Math.sin(state.phase)
    lLeg.rotation.x = s * 0.55
    rLeg.rotation.x = -s * 0.55
    lArm.rotation.x = -s * 0.4
    rArm.rotation.x = s * 0.4
    hips.position.y = 0.92 + (moving ? Math.abs(s) * 0.045 : 0)
    root.position.y = 0
  }

  return { root, head, update, setSmile }
}
