import * as THREE from 'three'
import { BANYAN, PALM_X, PALM_ZS } from '../config.js'
import { lambert, makeBarkTex, makePalmBarkTex } from '../gfx.js'

function leafGeo() {
  const geo = new THREE.BoxGeometry(0.42, 0.05, 3.3, 1, 1, 3)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i)
    const t = (z + 1.65) / 3.3
    pos.setY(i, pos.getY(i) - t * t * 0.55)
    pos.setX(i, pos.getX(i) * (1.15 - t * 0.85))
  }
  geo.translate(0, 0, 1.55)
  geo.computeVertexNormals()
  return geo
}

export function createPalms() {
  const group = new THREE.Group()
  group.name = 'palms'
  const positions = []
  for (const z of PALM_ZS) {
    positions.push([-PALM_X, z], [PALM_X, z])
  }
  const extra = [
    [-18, 22],
    [20, 26],
    [-22, 34],
    [22, 38],
    [-8, 44],
    [8, 44],
  ]
  for (const p of extra) positions.push(p)

  const n = positions.length
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.3, 11.2, 7)
  const trunkMat = lambert(0x8a7a66, { map: makePalmBarkTex() })
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, n)
  trunks.castShadow = true
  trunks.receiveShadow = true

  const leavesPer = 11
  const leafCount = n * leavesPer
  const leaves = new THREE.InstancedMesh(
    leafGeo(),
    new THREE.MeshLambertMaterial({
      color: 0x4f7c40,
      side: THREE.DoubleSide,
      flatShading: true,
    }),
    leafCount,
  )
  leaves.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(leafCount * 3),
    3,
  )

  const dummy = new THREE.Object3D()
  const color = new THREE.Color()
  let li = 0
  positions.forEach(([x, z], i) => {
    const h = 0.9 + (i % 5) * 0.04
    dummy.position.set(x, 5.6 * h, z)
    dummy.scale.set(1, h, 1)
    dummy.rotation.set(0, i * 0.7, 0)
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)

    dummy.scale.set(1, 1, 1)
    for (let k = 0; k < leavesPer; k++) {
      const yaw = (k / leavesPer) * Math.PI * 2 + i * 0.13
      dummy.position.set(x, 11.15 * h, z)
        dummy.rotation.set(0.55 + (k % 3) * 0.12, yaw, 0)
      dummy.updateMatrix()
      leaves.setMatrixAt(li, dummy.matrix)
      color.setHSL(0.28, 0.48, 0.36 + (k % 4) * 0.05)
      leaves.setColorAt(li, color)
      li++
    }
  })
  trunks.instanceMatrix.needsUpdate = true
  leaves.instanceMatrix.needsUpdate = true
  leaves.instanceColor.needsUpdate = true
  group.add(trunks, leaves)

  const blobGeo = new THREE.CircleGeometry(1.3, 8)
  const blobMat = new THREE.MeshBasicMaterial({
    color: 0x1a140e,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  })
  const blobs = new THREE.InstancedMesh(blobGeo, blobMat, n)
  positions.forEach(([x, z], i) => {
    dummy.position.set(x, 0.02, z)
    dummy.rotation.set(-Math.PI / 2, 0, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    blobs.setMatrixAt(i, dummy.matrix)
  })
  group.add(blobs)
  return { group, colliders: positions.map(([x, z]) => ({ type: 'circle', x, z, r: 0.55 })) }
}

function addCanopy(parent, x, y, z, s, color) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(s, 0),
    lambert(color, { flatShading: true }),
  )
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  parent.add(mesh)
}

export function createBanyan(colliders) {
  const g = new THREE.Group()
  g.name = 'banyan'
  g.position.set(BANYAN.x, 0, BANYAN.z)
  const bark = lambert(0x5c4a38, { map: makeBarkTex() })

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.45, 4.2, 8), bark)
  trunk.position.y = 2.1
  trunk.castShadow = true
  g.add(trunk)

  const lean = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 3.4, 6), bark)
  lean.position.set(1.3, 2.4, 0.4)
  lean.rotation.z = -0.45
  lean.castShadow = true
  g.add(lean)

  const second = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 3.6, 6), bark)
  second.position.set(-1.6, 1.8, 0.8)
  second.castShadow = true
  g.add(second)

  const greens = [0x3a5c34, 0x4a6e40, 0x2f4e2c, 0x45683a]
  const clumps = [
    [0, 6.6, 0, 3.6],
    [-2.8, 5.7, 1.4, 2.6],
    [2.8, 5.9, 0.8, 2.7],
    [0.5, 7.0, -2.4, 2.5],
    [-1.8, 5.3, -2.0, 2.2],
    [2.0, 5.2, 2.4, 2.3],
    [0.2, 7.6, 1.6, 2.0],
    [-3.6, 4.7, 0.3, 1.9],
  ]
  clumps.forEach((c, i) => addCanopy(g, c[0], c[1], c[2], c[3], greens[i % greens.length]))

  const rootMat = lambert(0x6a5644)
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2
    const reach = 1.4 + (i % 5) * 0.45
    const len = i % 3 === 0 ? 5.8 : 2.4 + (i % 4) * 1.0
    const root = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.12, len, 4),
      rootMat,
    )
    root.position.set(
      Math.cos(a) * reach,
      i % 3 === 0 ? len / 2 : 6.4 - len / 2,
      Math.sin(a) * reach * 0.85,
    )
    if (i % 3 === 0) {
      root.position.y = len / 2
      root.scale.y = 1
    }
    g.add(root)
  }

  colliders.push({ type: 'circle', x: BANYAN.x, z: BANYAN.z, r: 1.7 })
  return g
}

export function createFallenLeaves() {
  const n = 80
  const geo = new THREE.CircleGeometry(0.16, 5)
  const mat = new THREE.MeshLambertMaterial({
    color: 0x6a5a32,
    side: THREE.DoubleSide,
    flatShading: true,
  })
  const mesh = new THREE.InstancedMesh(geo, mat, n)
  const dummy = new THREE.Object3D()
  const color = new THREE.Color()
  for (let i = 0; i < n; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 5.4,
      0.03,
      2 + Math.random() * 36,
    )
    dummy.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI)
    dummy.scale.setScalar(0.7 + Math.random() * 0.8)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
    color.setHSL(0.1, 0.38, 0.26 + (i % 7) * 0.03)
    mesh.setColorAt(i, color)
  }
  return mesh
}
