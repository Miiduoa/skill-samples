import * as THREE from 'three'
import { aabb } from '../collision.js'
import { lambert, makePlaqueTex, makeTileTex, standard } from '../gfx.js'

function pillar(x, z, h = 6.8) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.75, 1.45),
    standard(0xcfc6b8, { roughness: 0.9 }),
  )
  base.position.y = 0.37
  base.castShadow = true
  g.add(base)

  const col = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, h, 0.78),
    standard(0xd24a38, { roughness: 0.58 }),
  )
  col.position.y = 0.75 + h / 2
  col.castShadow = true
  g.add(col)

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(1.02, 0.22, 1.02),
    standard(0xe8c868, { roughness: 0.4, metalness: 0.22 }),
  )
  cap.position.y = 0.75 + h + 0.08
  g.add(cap)
  g.position.set(x, 0, z)
  return g
}

function roof(width, depth, y, scale = 1) {
  const g = new THREE.Group()
  const tile = standard(0x4f8a62, { map: makeTileTex(), roughness: 0.48 })
  const wood = standard(0x6a3e28, { roughness: 0.7 })
  const gold = standard(0xe8c868, { roughness: 0.4, metalness: 0.25 })

  const soffit = new THREE.Mesh(
    new THREE.BoxGeometry(width + 1.4 * scale, 0.12, depth + 0.8 * scale),
    wood,
  )
  soffit.position.y = y
  g.add(soffit)

  const slopeGeo = new THREE.BoxGeometry(width + 1.6 * scale, 0.2, depth * 0.72)
  const s1 = new THREE.Mesh(slopeGeo, tile)
  s1.rotation.x = 0.36
  s1.position.set(0, y + 0.62 * scale, -depth * 0.28)
  s1.castShadow = true
  const s2 = s1.clone()
  s2.rotation.x = -0.36
  s2.position.z = depth * 0.28
  g.add(s1, s2)

  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.6 * scale, 0.32, 0.38),
    gold,
  )
  ridge.position.y = y + 1.05 * scale
  g.add(ridge)

  for (const sx of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 1.35), tile)
    horn.position.set((width / 2) * sx * 0.92, y + 0.55 * scale, 0)
    horn.rotation.z = sx * 0.42
    g.add(horn)
    for (const sz of [-1, 1]) {
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 1.05), tile)
      tip.position.set((width / 2) * sx, y + 0.32 * scale, (depth / 2) * sz * 0.85)
      tip.rotation.set(sz * -0.5, 0, sx * 0.22)
      g.add(tip)
    }
  }

  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 4), gold)
  fin.position.y = y + 1.45 * scale
  g.add(fin)
  return g
}

export function createGate(colliders) {
  const root = new THREE.Group()
  root.name = 'gate'

  const span = 5.8
  root.add(pillar(-span / 2, 0))
  root.add(pillar(span / 2, 0))
  root.add(pillar(-span / 2 - 3.2, 0.12, 5.1))
  root.add(pillar(span / 2 + 3.2, 0.12, 5.1))

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(span + 1.6, 0.5, 0.72),
    standard(0xd24a38, { roughness: 0.55 }),
  )
  beam.position.y = 7.15
  beam.castShadow = true
  root.add(beam)

  const plaqueMap = makePlaqueTex()
  const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueMap })
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.25), plaqueMat)
  plaque.position.set(0, 6.35, 0.4)
  root.add(plaque)
  const back = plaque.clone()
  back.position.z = -0.4
  back.rotation.y = Math.PI
  root.add(back)

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(5.7, 1.4, 0.12),
    standard(0xe8c868, { roughness: 0.4, metalness: 0.2 }),
  )
  frame.position.set(0, 6.35, 0)
  root.add(frame)

  root.add(roof(span + 2.8, 3.8, 7.35))
  const sideRoofL = roof(3.4, 2.8, 5.7, 0.85)
  sideRoofL.position.x = -span / 2 - 3.2
  const sideRoofR = roof(3.4, 2.8, 5.7, 0.85)
  sideRoofR.position.x = span / 2 + 3.2
  root.add(sideRoofL, sideRoofR)

  const wallMat = lambert(0xe4d8c4)
  for (const x of [-8.6, 8.6]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.2, 0.36), wallMat)
    wall.position.set(x, 1.1, 0.15)
    wall.castShadow = true
    wall.receiveShadow = true
    root.add(wall)
    colliders.push(aabb(x, 0.15, 5.0, 0.7))
  }

  const step = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.16, 2.4),
    standard(0xc8c0b2, { roughness: 0.88 }),
  )
  step.position.set(0, 0.08, 0)
  step.receiveShadow = true
  root.add(step)

  colliders.push(aabb(-span / 2, 0, 1.15, 1.15))
  colliders.push(aabb(span / 2, 0, 1.15, 1.15))
  colliders.push(aabb(-span / 2 - 3.2, 0.12, 1.15, 1.15))
  colliders.push(aabb(span / 2 + 3.2, 0.12, 1.15, 1.15))

  return root
}
