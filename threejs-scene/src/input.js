export function createInput(canvas) {
  const keys = new Set()
  const look = { x: 0, y: 0, dragging: false, px: 0, py: 0 }
  const stick = { x: 0, y: 0, active: false }

  window.addEventListener('keydown', (e) => {
    keys.add(e.code)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault()
    }
  })
  window.addEventListener('keyup', (e) => keys.delete(e.code))

  canvas.addEventListener('pointerdown', (e) => {
    if (e.target.closest?.('#joystick') || e.target.closest?.('#aerial-btn')) return
    look.dragging = true
    look.px = e.clientX
    look.py = e.clientY
    canvas.setPointerCapture?.(e.pointerId)
  })
  window.addEventListener('pointerup', () => {
    look.dragging = false
  })
  window.addEventListener('pointermove', (e) => {
    if (!look.dragging) return
    look.x -= (e.clientX - look.px) * 0.005
    look.y -= (e.clientY - look.py) * 0.003
    look.y = Math.max(-0.35, Math.min(0.55, look.y))
    look.px = e.clientX
    look.py = e.clientY
  })

  const joy = document.getElementById('joystick')
  const knob = document.getElementById('knob')
  const touchy = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 720
  if (joy && touchy) {
    joy.hidden = false
    const setStick = (cx, cy) => {
      const r = joy.getBoundingClientRect()
      const dx = cx - (r.left + r.width / 2)
      const dy = cy - (r.top + r.height / 2)
      const max = r.width * 0.34
      const len = Math.hypot(dx, dy)
      const s = len > max ? max / len : 1
      stick.x = (dx * s) / max
      stick.y = (dy * s) / max
      knob.style.transform = `translate(${dx * s}px, ${dy * s}px)`
    }
    const end = () => {
      stick.x = 0
      stick.y = 0
      stick.active = false
      knob.style.transform = 'translate(0,0)'
    }
    joy.addEventListener('pointerdown', (e) => {
      stick.active = true
      joy.setPointerCapture(e.pointerId)
      setStick(e.clientX, e.clientY)
      e.preventDefault()
    })
    joy.addEventListener('pointermove', (e) => {
      if (!stick.active) return
      setStick(e.clientX, e.clientY)
    })
    joy.addEventListener('pointerup', end)
    joy.addEventListener('pointercancel', end)
  }

  function getMove() {
    let x = stick.x
    let z = stick.y
    if (keys.has('KeyW') || keys.has('ArrowUp')) z -= 1
    if (keys.has('KeyS') || keys.has('ArrowDown')) z += 1
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1
    const len = Math.hypot(x, z)
    if (len > 1) {
      x /= len
      z /= len
    }
    return { x, z, moving: len > 0.08 }
  }

  return { getMove, look, keys }
}
