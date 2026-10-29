import * as THREE from 'three'
import { Reflector } from 'three/addons/objects/Reflector.js'
import { POND } from '../config.js'
import { lambert, standard } from '../gfx.js'

export function createPond(colliders) {
  const g = new THREE.Group()
  g.name = 'pond'
  g.position.set(POND.x, 0, POND.z)

  const shape = new THREE.Shape()
  const steps = 24
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const rx = POND.rx * (0.92 + Math.sin(t * 3) * 0.08)
    const rz = POND.rz * (0.9 + Math.cos(t * 2.4) * 0.1)
    const x = Math.cos(t) * rx
    const y = Math.sin(t) * rz
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }

  const waterGeo = new THREE.ShapeGeometry(shape, 12)
  const isMobile = window.innerWidth < 700
  const reflector = new Reflector(waterGeo, {
    clipBias: 0.003,
    textureWidth: isMobile ? 256 : 512,
    textureHeight: isMobile ? 256 : 512,
    color: 0x6a8074,
    multisample: 0,
  })
  reflector.rotation.x = -Math.PI / 2
  reflector.position.y = 0.04
  g.add(reflector)

  const tint = new THREE.Mesh(
    waterGeo,
    new THREE.MeshLambertMaterial({
      color: 0x4a6a5e,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
  )
  tint.rotation.x = -Math.PI / 2
  tint.position.y = 0.05
  g.add(tint)

  const bank = new THREE.Mesh(
    new THREE.RingGeometry(5.1, 7.1, 24),
    lambert(0x6a6048),
  )
  bank.rotation.x = -Math.PI / 2
  bank.position.y = 0.02
  bank.receiveShadow = true
  g.add(bank)

  const stoneMat = standard(0x8a8478, { roughness: 0.92, flatShading: true })
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.28 + (i % 3) * 0.1, 0),
      stoneMat,
    )
    stone.position.set(Math.cos(a) * 6.1, 0.16, Math.sin(a) * 5.0)
    stone.rotation.set(i, i * 0.4, 0)
    stone.castShadow = true
    g.add(stone)
  }

  const lilyMat = lambert(0x3a6238, { side: THREE.DoubleSide })
  for (let i = 0; i < 5; i++) {
    const lily = new THREE.Mesh(new THREE.CircleGeometry(0.38, 8), lilyMat)
    lily.rotation.x = -Math.PI / 2
    lily.position.set(
      Math.cos(i * 1.7) * 3.4,
      0.07,
      Math.sin(i * 1.7) * 2.6,
    )
    g.add(lily)
  }

  colliders.push({
    type: 'ellipse',
    x: POND.x,
    z: POND.z,
    rx: POND.rx + 0.35,
    rz: POND.rz + 0.35,
  })

  return { group: g, reflector }
}
