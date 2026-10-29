import { spawn } from 'node:child_process'
import { copyFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const PORT = process.env.PORT || 4876
const BASE = `http://127.0.0.1:${PORT}`
const OUT = path.resolve('tmp-capture')
const ART = '/opt/cursor/artifacts'
const BOT = '/cursor/stores/bot/learn-threejs-scene'
const W = 390
const H = 844

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' })
    p.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
    )
  })
}

async function publish(src, name) {
  await mkdir(ART, { recursive: true })
  await mkdir(BOT, { recursive: true })
  await copyFile(src, path.join(ART, name))
  await copyFile(src, path.join(BOT, name))
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-gl=angle', '--ignore-gpu-blocklist'],
})

const still = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
})
still.on('pageerror', (err) => console.error('pageerror', err))
await still.goto(`${BASE}/?ui=0`, { waitUntil: 'networkidle', timeout: 30000 })
await still.waitForFunction(() => window.__ready === true, { timeout: 20000 })
await still.waitForTimeout(900)

const shots = {}
for (const name of ['aerial', 'gate', 'pond', 'bus']) {
  await still.evaluate((n) => window.__shot(n), name)
  await still.waitForTimeout(280)
  const file = path.join(OUT, `${name}.png`)
  await still.screenshot({ path: file, type: 'png' })
  shots[name] = file
  console.log('shot', name)
}
await still.close()

const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
  recordVideo: { dir: OUT, size: { width: W, height: H } },
})
const page = await context.newPage()
await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForFunction(() => window.__ready === true, { timeout: 20000 })
await page.waitForTimeout(500)
await page.evaluate(() => window.__playDemo())
await page.waitForTimeout(18500)
await page.close()
await context.close()
await browser.close()

const { readdir: list, stat } = await import('node:fs/promises')
const webms = await list(OUT)
const webmName = (
  await Promise.all(
    webms
      .filter((f) => f.endsWith('.webm'))
      .map(async (f) => ({ f, t: (await stat(path.join(OUT, f))).mtimeMs })),
  )
).sort((a, b) => b.t - a.t)[0]?.f
if (!webmName) throw new Error('no webm recorded')
const webmPath = path.join(OUT, webmName)
const mp4 = path.join(OUT, 'walkthrough.mp4')
await run('ffmpeg', [
  '-y',
  '-i',
  webmPath,
  '-an',
  '-c:v',
  'libx264',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  mp4,
])

for (const [src, name] of [
  [shots.aerial, 'shot-aerial.png'],
  [shots.gate, 'shot-gate.png'],
  [shots.pond, 'shot-pond.png'],
  [shots.bus, 'shot-bus.png'],
  [mp4, 'walkthrough.mp4'],
]) {
  await publish(src, name)
}

console.log('capture complete', mp4)
