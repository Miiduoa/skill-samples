export function resolveCollision(x, z, radius, colliders) {
  let px = x
  let pz = z
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i]
    if (c.type === 'circle') {
      const dx = px - c.x
      const dz = pz - c.z
      const d = Math.hypot(dx, dz) || 0.0001
      const min = radius + c.r
      if (d < min) {
        const s = min / d
        px = c.x + dx * s
        pz = c.z + dz * s
      }
    } else if (c.type === 'ellipse') {
      const nx = (px - c.x) / (c.rx + radius)
      const nz = (pz - c.z) / (c.rz + radius)
      const d2 = nx * nx + nz * nz
      if (d2 < 1) {
        const d = Math.sqrt(d2) || 0.0001
        px = c.x + (nx / d) * (c.rx + radius)
        pz = c.z + (nz / d) * (c.rz + radius)
      }
    } else if (c.type === 'aabb') {
      const nearestX = Math.max(c.minX, Math.min(px, c.maxX))
      const nearestZ = Math.max(c.minZ, Math.min(pz, c.maxZ))
      let dx = px - nearestX
      let dz = pz - nearestZ
      const inside = px > c.minX && px < c.maxX && pz > c.minZ && pz < c.maxZ
      if (inside) {
        const left = px - c.minX
        const right = c.maxX - px
        const down = pz - c.minZ
        const up = c.maxZ - pz
        const m = Math.min(left, right, down, up)
        if (m === left) px = c.minX - radius
        else if (m === right) px = c.maxX + radius
        else if (m === down) pz = c.minZ - radius
        else pz = c.maxZ + radius
      } else {
        const dist = Math.hypot(dx, dz)
        if (dist < radius && dist > 1e-6) {
          const s = radius / dist
          px = nearestX + dx * s
          pz = nearestZ + dz * s
        }
      }
    }
  }
  px = Math.max(-36, Math.min(36, px))
  pz = Math.max(-24, Math.min(48, pz))
  return { x: px, z: pz }
}

export function aabb(x, z, w, d) {
  return {
    type: 'aabb',
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2,
  }
}
