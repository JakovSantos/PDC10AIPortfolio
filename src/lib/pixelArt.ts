// Procedural 16-bit pixel art. Everything is drawn at low resolution on a canvas
// and scaled up with `image-rendering: pixelated`, so the scenery has real chunky pixels.

export type Variant = 'day' | 'sunset' | 'night' | 'cave'

export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Pal {
  sky: string[]
  sun: string
  ring: string
  far: [string, string, string, string] // base, shade, snow, snowShade
  near: [string, string, string, string]
  hill: [string, string, string] // base, top, shade
  tree: [string, string, string, string] // canopy, light, dark, outline
  trunk: string
  grass: [string, string, string] // base, top, dark
  flowers: string[]
  cloud: [string, string]
  stars: boolean
}

export const PALETTES: Record<Exclude<Variant, 'cave'>, Pal> = {
  day: {
    sky: ['#4ba3e3', '#5fb3ec', '#76c3f2', '#8fd1f6', '#a9ddf8', '#c6e9fa'],
    sun: '#fff6c9',
    ring: '#ffe486',
    far: ['#a8bde0', '#8ea5d0', '#f6f9ff', '#d5e1f5'],
    near: ['#7d97c4', '#6580b0', '#eef4ff', '#c6d4ee'],
    hill: ['#8bc95a', '#aadd74', '#72b447'],
    tree: ['#4f9a3a', '#73c04f', '#3a7a2e', '#24502a'],
    trunk: '#7a4a22',
    grass: ['#6cb544', '#92d35c', '#58a03a'],
    flowers: ['#ffffff', '#ffd54a', '#ff7a8a', '#c9a2ff'],
    cloud: ['#ffffff', '#d9eefb'],
    stars: false,
  },
  sunset: {
    sky: ['#3b2a63', '#5e3577', '#8f4374', '#c95a66', '#ec8a5c', '#ffc27a'],
    sun: '#fff0b8',
    ring: '#ffb35e',
    far: ['#8a6a96', '#715582', '#ffe2cf', '#e3b2b7'],
    near: ['#634c7d', '#4d3a66', '#f7cfc4', '#cf9fae'],
    hill: ['#5f8f4a', '#7eab5b', '#4a7639'],
    tree: ['#3f7a3a', '#5e9b48', '#2e5c2c', '#1d3b20'],
    trunk: '#5e3a1e',
    grass: ['#4f8a3a', '#6ba648', '#3e7330'],
    flowers: ['#ffe2a8', '#ffb35e', '#ff8fa0'],
    cloud: ['#ffd2a6', '#e9a08a'],
    stars: false,
  },
  night: {
    sky: ['#0b0e2e', '#11173f', '#18204f', '#202a61', '#283572', '#314083'],
    sun: '#f6f2d5',
    ring: '#c8c4a0',
    far: ['#2d3768', '#232c56', '#bcc6e8', '#8f9bc9'],
    near: ['#232b55', '#1b2246', '#9aa6d4', '#7280b5'],
    hill: ['#2c4f3c', '#3d6a4d', '#213f30'],
    tree: ['#1f4030', '#2d5c41', '#163226', '#0d1f17'],
    trunk: '#3a2717',
    grass: ['#264a35', '#37664a', '#1c3a2a'],
    flowers: ['#c9d6ff', '#fff3a8'],
    cloud: ['#3d4a80', '#2c3768'],
    stars: true,
  },
}

type Ctx = CanvasRenderingContext2D

function px(ctx: Ctx, x: number, y: number, c: string, w = 1, h = 1) {
  ctx.fillStyle = c
  ctx.fillRect(Math.round(x), Math.round(y), w, h)
}

function disc(ctx: Ctx, cx: number, cy: number, r: number, c: string) {
  ctx.fillStyle = c
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35)
    ctx.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1)
  }
}

/* ---------------- sky ---------------- */
export function drawSky(ctx: Ctx, w: number, h: number, pal: Pal, seed = 1) {
  const r = rng(seed)
  const bands = pal.sky.length
  const bandH = Math.ceil(h / bands)
  for (let i = 0; i < bands; i++) {
    px(ctx, 0, i * bandH, pal.sky[i], w, bandH + 1)
    // dithered seam between bands
    if (i > 0) {
      ctx.fillStyle = pal.sky[i - 1]
      for (let x = 0; x < w; x++) {
        if (x % 2 === 0) ctx.fillRect(x, i * bandH, 1, 1)
        if (x % 4 === 1) ctx.fillRect(x, i * bandH + 1, 1, 1)
      }
    }
  }
  if (pal.stars) {
    for (let i = 0; i < (w * h) / 90; i++) {
      const x = Math.floor(r() * w)
      const y = Math.floor(r() * h * 0.7)
      px(ctx, x, y, r() > 0.85 ? '#fff6c9' : '#c9d2ff')
      if (r() > 0.93) {
        px(ctx, x - 1, y, '#8e9ad6')
        px(ctx, x + 1, y, '#8e9ad6')
        px(ctx, x, y - 1, '#8e9ad6')
        px(ctx, x, y + 1, '#8e9ad6')
      }
    }
  }
  // sun or moon
  const sx = Math.round(w * 0.8)
  const sy = Math.round(h * (pal.stars ? 0.16 : pal === PALETTES.sunset ? 0.55 : 0.17))
  const sr = Math.max(5, Math.round(Math.min(w, h) * 0.045))
  disc(ctx, sx, sy, sr + 2, pal.ring)
  disc(ctx, sx, sy, sr, pal.sun)
  if (pal.stars) {
    disc(ctx, sx + Math.round(sr * 0.45), sy - Math.round(sr * 0.25), Math.round(sr * 0.75), pal.sky[1])
  } else {
    px(ctx, sx - Math.round(sr * 0.4), sy - Math.round(sr * 0.5), '#ffffff', 2, 2)
  }
}

/* ---------------- clouds (as standalone sprites) ---------------- */
export function cloudCanvas(seed: number, pal: Pal, scale = 1) {
  const r = rng(seed)
  const w = Math.round((34 + r() * 26) * scale)
  const h = Math.round(16 * scale)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const puffs = 3 + Math.floor(r() * 3)
  for (let i = 0; i < puffs; i++) {
    const cx = Math.round(w * (0.18 + (i / (puffs - 1)) * 0.64))
    const rad = Math.round((4 + r() * 4) * scale)
    disc(ctx, cx, h - rad - 2, rad, pal.cloud[0])
  }
  px(ctx, Math.round(w * 0.12), h - 5, pal.cloud[0], Math.round(w * 0.76), 3)
  px(ctx, Math.round(w * 0.12), h - 3, pal.cloud[1], Math.round(w * 0.76), 2)
  return c
}

/* ---------------- mountains ---------------- */
function mountains(ctx: Ctx, w: number, h: number, base: number, maxH: number, colors: Pal['far'], seed: number, spacing: number) {
  const r = rng(seed)
  const peaks: { x: number; h: number; s: number }[] = []
  for (let x = -spacing; x < w + spacing; x += spacing * (0.6 + r() * 0.6)) {
    peaks.push({ x, h: maxH * (0.55 + r() * 0.45), s: 0.75 + r() * 0.5 })
  }
  for (let x = 0; x < w; x++) {
    let best = -1e9
    let bp = peaks[0]
    for (const p of peaks) {
      const v = p.h - Math.abs(x - p.x) * p.s
      if (v > best) {
        best = v
        bp = p
      }
    }
    if (best <= 0) continue
    const top = Math.round(base - best)
    const shade = x > bp.x
    px(ctx, x, top, shade ? colors[1] : colors[0], 1, h - top)
    const apex = base - bp.h
    if (bp.h > maxH * 0.68) {
      const depth = Math.round(bp.h * 0.22 + ((x * 7) % 3))
      const snowBottom = apex + depth
      if (top < snowBottom) px(ctx, x, top, shade ? colors[3] : colors[2], 1, snowBottom - top)
    }
    // rocky texture
    if (r() > 0.92) px(ctx, x, top + 3 + Math.floor(r() * (h - top - 3)), colors[1])
  }
}

/* ---------------- trees ---------------- */
export function roundTree(ctx: Ctx, x: number, base: number, rad: number, pal: Pal) {
  const [canopy, light, dark, outline] = pal.tree
  px(ctx, x - 1, base - rad - 2, outline, 4, rad + 3)
  px(ctx, x, base - rad - 2, pal.trunk, 2, rad + 2)
  const cy = base - rad * 2 - 1
  disc(ctx, x + 1, cy, rad + 1, outline)
  disc(ctx, x + 1, cy, rad, canopy)
  disc(ctx, x + 1 + Math.round(rad * 0.3), cy + Math.round(rad * 0.35), Math.round(rad * 0.6), dark)
  disc(ctx, x + 1 - Math.round(rad * 0.3), cy - Math.round(rad * 0.3), Math.round(rad * 0.55), light)
  px(ctx, x - Math.round(rad * 0.4), cy - Math.round(rad * 0.6), '#ffffff40', 1, 1)
}

export function pineTree(ctx: Ctx, x: number, base: number, hgt: number, pal: Pal) {
  const [canopy, light, dark, outline] = pal.tree
  px(ctx, x, base - 3, pal.trunk, 2, 3)
  for (let i = 0; i < hgt; i++) {
    const y = base - 3 - i
    const half = Math.floor(((hgt - i) / hgt) * (hgt * 0.42)) + (i % 4 === 0 ? 1 : 0)
    px(ctx, x - half - 1, y, outline, half * 2 + 4, 1)
    px(ctx, x - half, y, canopy, half * 2 + 2, 1)
    px(ctx, x + 1, y, dark, half + 1, 1)
    if (i % 4 === 1) px(ctx, x - half, y, light, Math.max(1, half), 1)
  }
  px(ctx, x, base - 3 - hgt, outline, 2, 1)
}

/* ---------------- land (hills, trees, grass) ---------------- */
export function drawLand(
  ctx: Ctx,
  w: number,
  h: number,
  pal: Pal,
  seed = 3,
  opts: { hills?: number; grass?: number; path?: boolean; forest?: boolean } = {},
) {
  const r = rng(seed)
  const hillTop = Math.round(h * (opts.hills ?? 0.66))
  const grassTop = Math.round(h * (opts.grass ?? 0.84))

  // rolling hills
  const hillY: number[] = []
  for (let x = 0; x < w; x++) {
    const y = Math.round(hillTop - 7 * Math.sin(x / 23 + seed) - 4 * Math.sin(x / 9.5 + seed * 2))
    hillY.push(y)
    px(ctx, x, y, pal.hill[0], 1, h - y)
    px(ctx, x, y, pal.hill[1], 1, 1)
    if (r() > 0.85) px(ctx, x, y + 2 + Math.floor(r() * 10), pal.hill[2])
  }
  // pine forest line on the hills
  if (opts.forest !== false) {
    for (let x = 2; x < w; x += 5 + Math.floor(r() * 6)) {
      pineTree(ctx, x, hillY[Math.min(w - 1, x)] + 3, 9 + Math.floor(r() * 7), pal)
    }
  }
  // round trees in front of the forest
  for (let x = 6; x < w; x += 18 + Math.floor(r() * 22)) {
    const base = Math.round(hillY[Math.min(w - 1, x)] + (grassTop - hillTop) * (0.45 + r() * 0.4))
    roundTree(ctx, x, base, 4 + Math.floor(r() * 3), pal)
  }

  // foreground meadow
  for (let x = 0; x < w; x++) {
    const top = grassTop + (Math.sin(x / 7 + seed) > 0.6 ? -1 : 0)
    px(ctx, x, top, pal.grass[0], 1, h - top)
    px(ctx, x, top, pal.grass[1], 1, 1)
    const blade = r()
    if (blade > 0.55) px(ctx, x, top - 1, pal.grass[1])
    if (blade > 0.85) px(ctx, x, top - 2, pal.grass[1])
    if (r() > 0.8) px(ctx, x, top + 2 + Math.floor(r() * (h - top)), pal.grass[2])
    if (r() > 0.88) px(ctx, x, top + 3 + Math.floor(r() * (h - top)), pal.grass[1])
  }

  // dirt path toward the viewer
  if (opts.path) {
    for (let y = grassTop; y < h; y++) {
      const t = (y - grassTop) / Math.max(1, h - grassTop)
      const cx = w * 0.5 + Math.sin(t * 3) * w * 0.06
      const half = 3 + t * w * 0.12
      px(ctx, cx - half - 1, y, '#a8703f', Math.round(half * 2 + 2), 1)
      px(ctx, cx - half, y, '#d9a066', Math.round(half * 2), 1)
      if (r() > 0.6) px(ctx, cx - half + r() * half * 2, y, '#c48a4a')
    }
  }

  // flowers
  for (let i = 0; i < w / 4; i++) {
    const x = Math.floor(r() * w)
    const y = grassTop + 3 + Math.floor(r() * (h - grassTop - 4))
    const c = pal.flowers[Math.floor(r() * pal.flowers.length)]
    px(ctx, x, y - 1, c)
    px(ctx, x - 1, y, c)
    px(ctx, x + 1, y, c)
    px(ctx, x, y + 1, c)
    px(ctx, x, y, '#ffd54a')
  }
}

export function drawMountains(ctx: Ctx, w: number, h: number, pal: Pal, seed = 2, base = 0.7) {
  mountains(ctx, w, h, Math.round(h * (base - 0.04)), Math.round(h * 0.34), pal.far, seed, 46)
  mountains(ctx, w, h, Math.round(h * base), Math.round(h * 0.22), pal.near, seed + 7, 30)
}

/* ---------------- cave (dungeon) ---------------- */
export function drawCave(ctx: Ctx, w: number, h: number, seed = 9) {
  const r = rng(seed)
  px(ctx, 0, 0, '#2a2433', w, h)
  // stone bricks
  for (let y = 0; y < h; y += 6) {
    const off = (y / 6) % 2 ? 6 : 0
    for (let x = -off; x < w; x += 12) {
      const tone = r() > 0.5 ? '#3a3346' : '#342e40'
      px(ctx, x + 1, y + 1, tone, 10, 4)
      px(ctx, x + 1, y + 1, '#4a4258', 10, 1)
    }
  }
  // stalactites
  for (let x = 0; x < w; x += 4 + Math.floor(r() * 8)) {
    const len = 3 + Math.floor(r() * 10)
    for (let i = 0; i < len; i++) px(ctx, x + Math.floor(i / 3), i, '#1d1825', Math.max(1, 4 - Math.floor(i / 3)), 1)
  }
  // floor
  const floor = Math.round(h * 0.82)
  px(ctx, 0, floor, '#4a4258', w, h - floor)
  px(ctx, 0, floor, '#6c6680', w, 1)
  for (let i = 0; i < w / 2; i++) px(ctx, Math.floor(r() * w), floor + 2 + Math.floor(r() * (h - floor)), '#3a3346')
  // torches with glow
  for (const tx of [0.15, 0.5, 0.85]) {
    const x = Math.round(w * tx)
    const y = Math.round(h * 0.4)
    for (let g = 10; g > 0; g -= 2) disc(ctx, x, y - 3, g, `rgba(255,170,60,${0.05})`)
    px(ctx, x - 1, y, '#5e3a1e', 3, 6)
    px(ctx, x - 1, y - 4, '#ff8c2a', 3, 4)
    px(ctx, x, y - 6, '#ffd54a', 1, 4)
  }
  // crystals
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(r() * w)
    const y = floor - 1
    px(ctx, x, y - 4, '#7fd3ff', 2, 5)
    px(ctx, x + 2, y - 2, '#4aa3e0', 2, 3)
    px(ctx, x, y - 4, '#d8f3ff', 1, 2)
  }
}

/* ---------------- world map ---------------- */
function distToSeg(px0: number, py0: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px0 - ax) * dx + (py0 - ay) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(px0 - (ax + t * dx), py0 - (ay + t * dy))
}

export function drawMap(ctx: Ctx, w: number, h: number, nodes: [number, number][], seed = 11) {
  const pal = PALETTES.day
  const r = rng(seed)
  const nearPath = (x: number, y: number) => {
    let d = 1e9
    for (let i = 0; i < nodes.length - 1; i++) d = Math.min(d, distToSeg(x, y, nodes[i][0], nodes[i][1], nodes[i + 1][0], nodes[i + 1][1]))
    return d
  }
  const nearNode = (x: number, y: number) => Math.min(...nodes.map(([nx, ny]) => Math.hypot(x - nx, y - ny)))

  // grass with soft 2x2 patches
  px(ctx, 0, 0, '#7cc04b', w, h)
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2) {
      const v = r()
      if (v > 0.86) px(ctx, x, y, '#8acb57', 2, 2)
      else if (v < 0.1) px(ctx, x, y, '#70b343', 2, 2)
    }

  // ponds away from the path
  const ponds: [number, number, number][] = []
  for (let tries = 0; tries < 60 && ponds.length < 3; tries++) {
    const pr = Math.round(Math.min(w, h) * (0.06 + r() * 0.04))
    const x = Math.round(pr + 2 + r() * (w - pr * 2 - 4))
    const y = Math.round(pr + 2 + r() * (h - pr * 2 - 4))
    if (nearPath(x, y) > pr + 8 && nearNode(x, y) > pr + 12 && ponds.every(([a, b, c]) => Math.hypot(a - x, b - y) > c + pr + 6))
      ponds.push([x, y, pr])
  }
  for (const [x, y, pr] of ponds) {
    disc(ctx, x, y, pr + 1, '#d9c27a')
    disc(ctx, x, y, pr, '#4aa3e0')
    disc(ctx, x - 1, y - 1, pr - 2, '#6cc0f0')
    px(ctx, x - Math.round(pr / 2), y - 1, '#d8f3ff', 3, 1)
    px(ctx, x + 1, y + Math.round(pr / 3), '#d8f3ff', 2, 1)
  }

  // dirt path
  for (let i = 0; i < nodes.length - 1; i++) {
    const [ax, ay] = nodes[i]
    const [bx, by] = nodes[i + 1]
    const steps = Math.ceil(Math.hypot(bx - ax, by - ay))
    for (let s = 0; s <= steps; s++) {
      const x = ax + ((bx - ax) * s) / steps
      const y = ay + ((by - ay) * s) / steps
      disc(ctx, x, y, 3, '#a8703f')
    }
  }
  for (let i = 0; i < nodes.length - 1; i++) {
    const [ax, ay] = nodes[i]
    const [bx, by] = nodes[i + 1]
    const steps = Math.ceil(Math.hypot(bx - ax, by - ay))
    for (let s = 0; s <= steps; s++) {
      const x = ax + ((bx - ax) * s) / steps
      const y = ay + ((by - ay) * s) / steps
      disc(ctx, x, y, 2, '#d9a066')
      if (s % 5 === 0) px(ctx, x + (r() > 0.5 ? 1 : -1), y, '#c48a4a')
    }
  }

  // tufts, flowers, rocks, trees
  for (let i = 0; i < (w * h) / 40; i++) {
    const x = Math.floor(r() * w)
    const y = Math.floor(r() * h)
    if (nearPath(x, y) < 5 || nearNode(x, y) < 9) continue
    if (ponds.some(([a, b, c]) => Math.hypot(a - x, b - y) < c + 2)) continue
    const k = r()
    if (k < 0.55) {
      px(ctx, x, y, '#5aa83e')
      px(ctx, x + 1, y - 1, '#92d35c')
      px(ctx, x + 2, y, '#5aa83e')
    } else if (k < 0.8) {
      const c = pal.flowers[Math.floor(r() * pal.flowers.length)]
      px(ctx, x, y, c)
      px(ctx, x, y + 1, '#4f8f3a')
    } else if (k < 0.88) {
      px(ctx, x, y, '#6c6680', 3, 2)
      px(ctx, x, y, '#c9c4d6', 2, 1)
    }
  }
  const trees: [number, number, number][] = []
  for (let tries = 0; tries < (w * h) / 30; tries++) {
    const edge = r() < 0.6
    const x = edge ? (r() < 0.5 ? Math.floor(r() * 10) : w - Math.floor(r() * 10)) : Math.floor(r() * w)
    const y = edge ? Math.floor(r() * h) : Math.floor(r() * h)
    const rad = 3 + Math.floor(r() * 3)
    if (nearPath(x, y - rad) < rad + 6 || nearNode(x, y - rad) < rad + 12) continue
    if (ponds.some(([a, b, c]) => Math.hypot(a - x, b - y) < c + rad + 3)) continue
    if (trees.some(([a, b]) => Math.hypot(a - x, b - y) < rad + 4)) continue
    trees.push([x, y, rad])
  }
  trees.sort((a, b) => a[1] - b[1])
  for (const [x, y, rad] of trees) roundTree(ctx, x, y, rad, pal)
}
