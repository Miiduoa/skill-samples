import * as THREE from 'three'
import { BUS, BUS_STOP, STORE } from '../config.js'
import { aabb } from '../collision.js'
import {
  lambert,
  makeBusLiveryTex,
  makeStoreSignTex,
  makeWindowTex,
  standard,
} from '../gfx.js'

export function createStore(colliders) {
  const g = new THREE.Group()
  g.name = 'store'
  g.position.set(STORE.x, 0, STORE.z)

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(STORE.w, STORE.h, STORE.d),
    standard(0xf0e6d4, { roughness: 0.78 }),
  )
  body.position.y = STORE.h / 2
  body.castShadow = true
  body.receiveShadow = true
  g.add(body)

  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(STORE.w + 0.08, 0.55, STORE.d + 0.08),
    lambert(0xe88932),
  )
  stripe.position.y = 3.15
  g.add(stripe)

  const signMap = makeStoreSignTex()
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.95, 0.18),
    new THREE.MeshStandardMaterial({
      map: signMap,
      emissive: 0xffb060,
      emissiveMap: signMap,
      emissiveIntensity: 1.15,
      roughness: 0.35,
    }),
  )
  sign.position.set(0, 4.55, STORE.d / 2 + 0.12)
  g.add(sign)

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(STORE.w + 0.4, 0.08, 1.3),
    lambert(0xd07028),
  )
  awning.position.set(0, 2.55, STORE.d / 2 + 0.55)
  awning.rotation.x = -0.18
  g.add(awning)

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 2.1),
    new THREE.MeshStandardMaterial({
      map: makeWindowTex(),
      emissive: 0xffc070,
      emissiveIntensity: 0.35,
      roughness: 0.25,
    }),
  )
  glass.position.set(0, 1.25, STORE.d / 2 + 0.03)
  g.add(glass)

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.2, 0.08),
    standard(0x88a0b0, { roughness: 0.2, metalness: 0.3, emissive: 0xffd090, emissiveIntensity: 0.2 }),
  )
  door.position.set(-2.4, 1.1, STORE.d / 2 + 0.05)
  g.add(door)

  const light = new THREE.PointLight(0xffc080, 2.4, 16, 2)
  light.position.set(0, 2.8, STORE.d / 2 + 0.8)
  g.add(light)

  colliders.push(aabb(STORE.x, STORE.z, STORE.w, STORE.d))
  return g
}

export function createBusAndStop(colliders) {
  const g = new THREE.Group()
  g.name = 'bus'

  const shelter = new THREE.Group()
  shelter.position.set(BUS_STOP.x, 0, BUS_STOP.z)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.1, 1.8),
    standard(0x4a4a48, { roughness: 0.6, metalness: 0.2 }),
  )
  roof.position.y = 2.55
  shelter.add(roof)
  for (const x of [-1.6, 1.6]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.5, 6),
      standard(0x333230),
    )
    post.position.set(x, 1.25, 0.7)
    shelter.add(post)
  }
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.5), lambert(0x6a5040))
  bench.position.set(0, 0.55, 0.15)
  shelter.add(bench)
  const signPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 3.1, 6),
    standard(0x222220),
  )
  signPole.position.set(-2.1, 1.55, -0.2)
  shelter.add(signPole)
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.1, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0x1e4a7a,
      emissive: 0x3a6aaa,
      emissiveIntensity: 0.25,
    }),
  )
  plate.position.set(-2.1, 2.5, -0.2)
  shelter.add(plate)
  g.add(shelter)
  colliders.push(aabb(BUS_STOP.x, BUS_STOP.z, 3.4, 1.5))

  const bus = new THREE.Group()
  bus.position.set(BUS.x, 0, BUS.z)
  bus.rotation.y = BUS.rot
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2.6, 8.8),
    new THREE.MeshStandardMaterial({
      map: makeBusLiveryTex(),
      roughness: 0.55,
    }),
  )
  body.position.y = 1.55
  body.castShadow = true
  bus.add(body)
  const front = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 1.1, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x88c8e8,
      emissive: 0xffe0a8,
      emissiveIntensity: 0.45,
      roughness: 0.2,
    }),
  )
  front.position.set(0, 1.85, 4.42)
  bus.add(front)
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.9, 8.2),
    new THREE.MeshStandardMaterial({
      color: 0x1a2428,
      emissive: 0xffc070,
      emissiveIntensity: 0.18,
      roughness: 0.3,
    }),
  )
  cabin.position.set(0, 2.35, 0)
  bus.add(cabin)
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.32, 12)
  const wheelMat = lambert(0x2a2a28)
  const hubMat = lambert(0x8a8880)
  for (const [x, z] of [
    [-1.25, 2.6],
    [1.25, 2.6],
    [-1.25, -2.8],
    [1.25, -2.8],
  ]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat)
    w.rotation.z = Math.PI / 2
    w.position.set(x, 0.5, z)
    bus.add(w)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.34, 8), hubMat)
    hub.rotation.z = Math.PI / 2
    hub.position.set(x, 0.5, z)
    bus.add(hub)
  }
  const dest = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.28, 0.06),
    new THREE.MeshBasicMaterial({ color: 0xffd090 }),
  )
  dest.position.set(0, 2.85, 4.42)
  bus.add(dest)
  const interior = new THREE.PointLight(0xffd0a0, 1.4, 12, 2)
  interior.position.set(0, 2.2, 0)
  bus.add(interior)
  const stopLight = new THREE.PointLight(0xffc090, 1.2, 14, 2)
  stopLight.position.set(BUS_STOP.x, 3.4, BUS_STOP.z)
  g.add(stopLight)
  g.add(bus)
  colliders.push(aabb(BUS.x, BUS.z, 9.2, 3.2))
  return g
}

export function createScooters() {
  const g = new THREE.Group()
  const bodyMat = lambert(0xc8b8a0)
  const spots = [
    [-11.4, -13.6, 0.2, 0x4a6a8a],
    [-10.4, -13.9, -0.1, 0xb04a3a],
    [-12.2, -14.2, 0.4, 0x3a3a38],
  ]
  for (const [x, z, yaw, color] of spots) {
    const s = new THREE.Group()
    s.position.set(x, 0, z)
    s.rotation.y = yaw
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 1.35), lambert(color))
    body.position.y = 0.55
    s.add(body)
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.5), bodyMat)
    seat.position.set(0, 0.82, -0.2)
    s.add(seat)
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 8)
    const wm = lambert(0x222220)
    for (const zz of [-0.5, 0.52]) {
      const w = new THREE.Mesh(wheelGeo, wm)
      w.rotation.z = Math.PI / 2
      w.position.set(0, 0.18, zz)
      s.add(w)
    }
    g.add(s)
  }
  return g
}
