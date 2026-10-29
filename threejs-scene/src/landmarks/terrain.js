import * as THREE from 'three'
import { PATH_WIDTH, STREET_Z } from '../config.js'
import { aabb } from '../collision.js'
import {
  lambert,
  makeAsphaltTex,
  makeBrickTex,
  makeGrassTex,
  standard,
} from '../gfx.js'

export function createGround() {
  const g = new THREE.Group()
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 140),
    lambert(0x5c6c48, { map: makeGrassTex() }),
  )
  grass.rotation.x = -Math.PI / 2
  grass.position.y = 0
  grass.receiveShadow = true
  g.add(grass)

  const brick = new THREE.Mesh(
    new THREE.PlaneGeometry(PATH_WIDTH, 56),
    lambert(0xc47a5c, { map: makeBrickTex() }),
  )
  brick.rotation.x = -Math.PI / 2
  brick.position.set(0, 0.012, 16)
  brick.receiveShadow = true
  g.add(brick)

  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(7.5, 24),
    lambert(0xc47a5c, {
      map: makeBrickTex({ repeatX: 4, repeatY: 4 }),
    }),
  )
  plaza.rotation.x = -Math.PI / 2
  plaza.position.set(0, 0.014, 0)
  plaza.receiveShadow = true
  g.add(plaza)

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 11),
    lambert(0x6a6864, { map: makeAsphaltTex() }),
  )
  road.rotation.x = -Math.PI / 2
  road.position.set(0, 0.01, STREET_Z - 3)
  road.receiveShadow = true
  g.add(road)

  const walk = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 4.2),
    lambert(0x8a8680),
  )
  walk.rotation.x = -Math.PI / 2
  walk.position.set(0, 0.013, STREET_Z + 3.4)
  walk.receiveShadow = true
  g.add(walk)

  const lineMat = new THREE.MeshBasicMaterial({ color: 0xd8d0bc })
  for (let i = -5; i <= 5; i++) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.2), lineMat)
    dash.rotation.x = -Math.PI / 2
    dash.position.set(i * 6.5, 0.02, STREET_Z - 3)
    g.add(dash)
  }

  const zebra = new THREE.MeshBasicMaterial({ color: 0xe8e0d0 })
  for (let i = -3; i <= 3; i++) {
    const z = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 9.2), zebra)
    z.rotation.x = -Math.PI / 2
    z.position.set(i * 1.05, 0.021, STREET_Z - 3)
    g.add(z)
  }

  const stone = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.1, 0.38),
    standard(0xc8c0b0, { roughness: 0.88 }),
  )
  stone.position.set(-7.8, 0.55, 3.4)
  stone.rotation.y = 0.4
  g.add(stone)
  return g
}

export function createCampusBuildings(colliders) {
  const g = new THREE.Group()
  const brick = standard(0x9c5a48, {
    map: makeBrickTex({ repeatX: 3, repeatY: 2 }),
    roughness: 0.8,
  })
  const roof = standard(0x3a6248, { roughness: 0.55 })
  const specs = [
    [-22, 52, 12, 5.2, 9],
    [24, 54, 11, 5.8, 8],
    [-12, 64, 14, 6.4, 10],
    [14, 66, 10, 4.8, 8],
  ]
  for (const [x, z, w, h, d] of specs) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), brick)
    b.position.set(x, h / 2, z)
    b.castShadow = true
    b.receiveShadow = true
    g.add(b)
    const r = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.35, d + 0.8), roof)
    r.position.set(x, h + 0.2, z)
    g.add(r)
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.5, 0.4), roof)
    ridge.position.set(x, h + 0.55, z)
    g.add(ridge)
    colliders.push(aabb(x, z, w, d))
  }
  return g
}

export function createHills() {
  const g = new THREE.Group()
  const mat = lambert(0x3a4a32, { flatShading: true })
  const treeMat = lambert(0x2f4630, { flatShading: true })
  const spots = [
    [-28, 58, 18, 8],
    [6, 64, 22, 10],
    [32, 56, 16, 7],
    [-40, 40, 12, 6],
  ]
  for (const [x, z, w, h] of spots) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat)
    hill.scale.set(w, h, w * 0.7)
    hill.position.set(x, 0, z)
    g.add(hill)
  }
  const dummy = new THREE.Object3D()
  const n = 90
  const trees = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.1, 3.2, 5),
    treeMat,
    n,
  )
  for (let i = 0; i < n; i++) {
    dummy.position.set(
      -40 + (i % 14) * 6.2 + (i % 3) * 0.8,
      2.2 + (i % 5) * 0.3,
      52 + Math.floor(i / 14) * 5.5,
    )
    dummy.scale.setScalar(0.7 + (i % 4) * 0.18)
    dummy.rotation.y = i
    dummy.updateMatrix()
    trees.setMatrixAt(i, dummy.matrix)
  }
  g.add(trees)
  return g
}

export function createLamps() {
  const g = new THREE.Group()
  const poleMat = standard(0x4a463e, { roughness: 0.7, metalness: 0.2 })
  const spots = [
    [-4.2, 6],
    [4.2, 6],
    [-4.2, 18],
    [4.2, 18],
    [-4.2, 30],
    [4.2, 30],
    [-10, -10.5],
    [10, -10.5],
  ]
  for (const [x, z] of spots) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 6), poleMat)
    pole.position.set(x, 2.1, z)
    g.add(pole)
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 6),
      new THREE.MeshStandardMaterial({
        color: 0xffe0b0,
        emissive: 0xffc070,
        emissiveIntensity: 1.1,
      }),
    )
    lamp.position.set(x, 4.25, z)
    g.add(lamp)
    const light = new THREE.PointLight(0xffc090, 0.55, 12, 2)
    light.position.set(x, 4.1, z)
    g.add(light)
  }
  return g
}

export function createHedge() {
  const n = 40
  const mesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.55, 5, 4),
    lambert(0x3a5234, { flatShading: true }),
    n,
  )
  const dummy = new THREE.Object3D()
  for (let i = 0; i < n; i++) {
    const side = i < 20 ? -1 : 1
    const k = i % 20
    dummy.position.set(side * 10.5, 0.5, 4 + k * 2.0)
    dummy.scale.set(1, 0.9 + (k % 3) * 0.1, 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  return mesh
}
