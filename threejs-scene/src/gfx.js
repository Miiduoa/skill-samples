import * as THREE from 'three'
import { COLORS } from './config.js'

export const FONT =
  'SceneCJK, "WenQuanYi Micro Hei", "Droid Sans Fallback", sans-serif'

export async function waitForFonts() {
  try {
    await document.fonts.load(`700 128px ${FONT}`)
    await document.fonts.ready
  } catch {
    /* keep going with fallback */
  }
}

function canvasTex(w, h, draw, repeatX = 1, repeatY = 1) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

export function makeBrickTex(opts = {}) {
  const brick = opts.brick || '#c47a5c'
  const brick2 = opts.brick2 || '#b66a50'
  const grout = opts.grout || '#8a5848'
  return canvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = grout
      ctx.fillRect(0, 0, w, h)
      const rows = 8
      const cols = 6
      const bh = h / rows
      const bw = w / cols
      for (let r = 0; r < rows; r++) {
        const offset = r % 2 ? bw * 0.5 : 0
        for (let c = -1; c < cols + 1; c++) {
          ctx.fillStyle = (r + c) % 3 === 0 ? brick2 : brick
          const x = c * bw + offset + 1
          const y = r * bh + 1
          ctx.fillRect(x, y, bw - 2.4, bh - 2.4)
        }
      }
    },
    opts.repeatX ?? 8,
    opts.repeatY ?? 14,
  )
}

export function makeAsphaltTex() {
  return canvasTex(
    128,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = '#5c5a56'
      ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 400; i++) {
        const n = 80 + Math.random() * 40
        ctx.fillStyle = `rgb(${n},${n},${n - 2})`
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
      }
    },
    10,
    4,
  )
}

export function makeGrassTex() {
  return canvasTex(
    128,
    128,
    (ctx, w, h) => {
        ctx.fillStyle = '#5a6a44'
        ctx.fillRect(0, 0, w, h)
        for (let i = 0; i < 700; i++) {
          ctx.fillStyle = i % 3 ? '#4e603c' : '#6a7a50'
          ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
        }
    },
    18,
    18,
  )
}

export function makeBarkTex() {
  return canvasTex(64, 256, (ctx, w, h) => {
    ctx.fillStyle = '#6a5848'
    ctx.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 7) {
      ctx.fillStyle = y % 14 === 0 ? '#5a4a3c' : '#7a6858'
      ctx.fillRect(0, y, w, 3)
    }
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = 'rgba(40,30,20,0.18)'
      ctx.fillRect(Math.random() * w, Math.random() * h, 4, 18)
    }
  })
}

export function makePalmBarkTex() {
  return canvasTex(32, 256, (ctx, w, h) => {
    ctx.fillStyle = '#8a7a66'
    ctx.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 8) {
      ctx.fillStyle = '#6e6254'
      ctx.fillRect(0, y, w, 2)
      ctx.fillStyle = '#9a8c78'
      ctx.fillRect(0, y + 3, w, 1)
    }
  })
}

export function makeTileTex() {
  return canvasTex(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#355a44'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#2a4838'
    ctx.lineWidth = 2
    for (let y = 0; y < h; y += 10) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
  })
}

export function makePlaqueTex() {
  return canvasTex(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1a1814'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#d6b15a'
    ctx.lineWidth = 10
    ctx.strokeRect(16, 14, w - 32, h - 28)
    ctx.strokeStyle = '#8a7038'
    ctx.lineWidth = 2
    ctx.strokeRect(28, 26, w - 56, h - 52)
    ctx.fillStyle = '#e6c56e'
    ctx.font = `700 128px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('榕園大學', w / 2, h / 2 + 6)
  })
}

export function makeStoreSignTex() {
  return canvasTex(1024, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#f0a24a')
    g.addColorStop(1, '#d07828')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#fff6e8'
    ctx.font = `700 92px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('榕 超', w / 2, h / 2 - 10)
    ctx.font = `600 28px ${FONT}`
    ctx.fillStyle = '#5a2e10'
    ctx.fillText('RY MART  ·  24H', w / 2, h / 2 + 62)
  })
}

export function makeBusLiveryTex() {
  return canvasTex(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#efe6d4'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2f5f8a'
    ctx.fillRect(0, h * 0.42, w, h * 0.22)
    ctx.fillStyle = '#c43c32'
    ctx.fillRect(0, h * 0.86, w, h * 0.14)
    ctx.fillStyle = '#1c1c1c'
    ctx.font = `700 48px ${FONT}`
    ctx.fillText('672', 40, 70)
    ctx.font = `600 32px ${FONT}`
    ctx.fillText('校門口', 160, 66)
  })
}

export function makeFaceTex(smiling) {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f0d2b4'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#3a2a22'
    ctx.beginPath()
    ctx.ellipse(86, 118, 10, 12, 0, 0, Math.PI * 2)
    ctx.ellipse(170, 118, 10, 12, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#5a3a30'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.beginPath()
    if (smiling) {
      ctx.arc(128, 150, 28, 0.15 * Math.PI, 0.85 * Math.PI)
    } else {
      ctx.moveTo(108, 168)
      ctx.quadraticCurveTo(128, 174, 148, 168)
    }
    ctx.stroke()
    ctx.fillStyle = 'rgba(220,120,100,0.22)'
    ctx.beginPath()
    ctx.ellipse(78, 148, 16, 8, 0, 0, Math.PI * 2)
    ctx.ellipse(178, 148, 16, 8, 0, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function makeWindowTex() {
  return canvasTex(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#f3d7a4')
    g.addColorStop(1, '#c8884a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(40,24,12,0.18)'
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(24 + i * 44, 30, 28, h - 70)
    }
    ctx.strokeStyle = 'rgba(80,50,30,0.35)'
    ctx.strokeRect(8, 8, w - 16, h - 16)
  })
}

export function lambert(color, extras = {}) {
  return new THREE.MeshLambertMaterial({ color, ...extras })
}

export function standard(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.04,
    ...extras,
  })
}

export function createSky() {
  const geo = new THREE.SphereGeometry(220, 24, 16)
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      zenith: { value: new THREE.Color('#6a7380') },
      mid: { value: new THREE.Color('#d08a62') },
      horizon: { value: new THREE.Color('#f2c8a0') },
      sunDir: { value: new THREE.Vector3(-0.72, 0.22, 0.38).normalize() },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPos;
      uniform vec3 zenith;
      uniform vec3 mid;
      uniform vec3 horizon;
      uniform vec3 sunDir;
      void main() {
        vec3 n = normalize(vPos);
        float h = n.y;
        vec3 col = mix(horizon, mid, smoothstep(-0.04, 0.16, h));
        col = mix(col, zenith, smoothstep(0.12, 0.72, h));
        float sun = pow(max(dot(n, sunDir), 0.0), 48.0);
        float glow = pow(max(dot(n, sunDir), 0.0), 6.0);
        col += vec3(1.0, 0.64, 0.28) * sun * 0.85;
        col += vec3(0.95, 0.55, 0.28) * glow * 0.22;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  return new THREE.Mesh(geo, mat)
}

export function createLighting(scene) {
  scene.fog = new THREE.Fog(COLORS.duskFog, 70, 170)

  const hemi = new THREE.HemisphereLight(0xf4d2b0, 0x5a6248, 1.05)
  scene.add(hemi)

  const amb = new THREE.AmbientLight(0xe0b890, 0.55)
  scene.add(amb)

  const sun = new THREE.DirectionalLight(0xffc888, 1.85)
  sun.position.set(-38, 22, 18)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.near = 4
  sun.shadow.camera.far = 110
  sun.shadow.camera.left = -42
  sun.shadow.camera.right = 42
  sun.shadow.camera.top = 42
  sun.shadow.camera.bottom = -42
  sun.shadow.bias = -0.0007
  sun.shadow.normalBias = 0.04
  scene.add(sun)

  const fill = new THREE.DirectionalLight(0x8898a8, 0.18)
  fill.position.set(20, 12, -30)
  scene.add(fill)

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffd19a }),
  )
  sunDisc.position.copy(sun.position).setLength(160)
  scene.add(sunDisc)

  return { sun, hemi }
}
