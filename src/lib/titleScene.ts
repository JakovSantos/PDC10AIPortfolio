// Title screen backdrop: a misty, layered valley with a castle on a hill,
// a winding path, dark pine silhouettes, and a rock ledge for Jakov to stand on.
// Drawn at low resolution and scaled up, like the rest of the scenery.
import { disc, px, rng, type Ctx } from './pixelArt'

/** Layout fractions shared with TitleScreen so the avatar stands on the ledge. */
export const TITLE = { castleX: 0.5, ledgeFrom: 0.6, ledgeTop: 0.8 }

const STONE = '#d2cbbf'
const STONE_SHADE = '#aea79c'
const STONE_EDGE = '#6f6a70'
const WINDOW = '#4f5566'

function tower(ctx: Ctx, x: number, baseY: number, w: number, hgt: number, roofH: number, flag: boolean) {
  const top = baseY - hgt
  const left = Math.round(x - w / 2)
  px(ctx, left - 1, top, STONE_EDGE, w + 2, hgt)
  px(ctx, left, top, STONE, w, hgt)
  px(ctx, left + Math.ceil(w * 0.6), top, STONE_SHADE, Math.floor(w * 0.4), hgt)
  for (let y = top + 3; y < baseY - 3; y += 5) px(ctx, Math.round(x), y, WINDOW, 1, 2)
  // conical red roof, shaded on the right
  for (let i = 0; i < roofH; i++) {
    const half = Math.max(0, Math.round(((i + 1) / roofH) * (w / 2 + 1)))
    const y = top - roofH + i
    px(ctx, Math.round(x) - half, y, '#b4525a', half, 1)
    px(ctx, Math.round(x), y, '#8c3c46', half + 1, 1)
  }
  if (flag) {
    const fy = top - roofH - 5
    px(ctx, Math.round(x), fy, '#5b5560', 1, 5)
    px(ctx, Math.round(x) + 1, fy, '#c4474f', 3, 1)
    px(ctx, Math.round(x) + 1, fy + 1, '#a8343c', 2, 1)
  }
}

export function drawCastle(ctx: Ctx, cx: number, baseY: number, s: number) {
  const t = (f: number) => Math.max(2, Math.round(f * s))
  // keep
  px(ctx, cx - t(0.2) - 1, baseY - t(0.44), STONE_EDGE, t(0.4) + 2, t(0.44))
  px(ctx, cx - t(0.2), baseY - t(0.44), STONE, t(0.4), t(0.44))
  px(ctx, cx + t(0.05), baseY - t(0.44), STONE_SHADE, t(0.15), t(0.44))
  for (let x = cx - t(0.2); x < cx + t(0.2); x += 2) px(ctx, x, baseY - t(0.44) - 1, STONE)
  for (let y = baseY - t(0.38); y < baseY - t(0.12); y += 5)
    for (let x = cx - t(0.15); x < cx + t(0.15); x += 4) px(ctx, x, y, WINDOW, 1, 2)
  // towers: [offset, width, height, roof height] as fractions of the castle size
  const towers: [number, number, number, number][] = [
    [0, 0.12, 0.86, 0.17],
    [0.11, 0.07, 0.7, 0.13],
    [-0.21, 0.1, 0.58, 0.15],
    [0.21, 0.1, 0.63, 0.15],
    [-0.35, 0.08, 0.4, 0.12],
    [0.37, 0.08, 0.44, 0.12],
  ]
  towers
    .slice()
    .sort((a, b) => b[2] - a[2])
    .forEach(([dx, w, hh, rh], i) => tower(ctx, cx + dx * s, baseY, t(w), t(hh), t(rh), i < 5))
  // curtain wall with battlements and a gate
  const ww = t(0.8)
  const wallTop = baseY - t(0.17)
  px(ctx, Math.round(cx - ww / 2) - 1, wallTop, STONE_EDGE, ww + 2, t(0.17))
  px(ctx, Math.round(cx - ww / 2), wallTop, '#c9c2b6', ww, t(0.17))
  px(ctx, Math.round(cx + ww * 0.15), wallTop, '#a69f95', Math.round(ww * 0.35), t(0.17))
  for (let x = Math.round(cx - ww / 2); x < cx + ww / 2; x += 2) px(ctx, x, wallTop - 1, '#c9c2b6')
  px(ctx, cx - t(0.04), baseY - t(0.09), '#3a3346', t(0.08), t(0.09))
}

interface Ridge {
  base: number
  amp: number
  freq: number
  phase: number
  color: string
  jag: number
  valley?: [number, number, number] // centre x, width, depth (fractions)
}

function ridge(ctx: Ctx, w: number, h: number, r: () => number, o: Ridge) {
  for (let x = 0; x < w; x++) {
    let y = h * o.base - h * o.amp * (0.55 + 0.3 * Math.sin(x * o.freq + o.phase) + 0.15 * Math.sin(x * o.freq * 2.7 + o.phase * 3))
    if (o.valley) {
      const [vx, vw, vd] = o.valley
      y += h * vd * Math.exp(-(((x - w * vx) / (w * vw)) ** 2))
    }
    // jagged treeline: pine tips poking up
    if (o.jag > 0) {
      const k = r()
      if (k > 0.7) y -= 1 + Math.floor(r() * o.jag)
      else if (k > 0.45) y -= 1
    }
    const yy = Math.round(y)
    if (yy < h) px(ctx, x, yy, o.color, 1, h - yy)
  }
}

function haze(ctx: Ctx, w: number, h: number, from: number, to: number, alpha: number) {
  ctx.fillStyle = `rgba(214, 232, 236, ${alpha})`
  ctx.fillRect(0, Math.round(h * from), w, Math.round(h * (to - from)))
}

function pine(ctx: Ctx, x: number, base: number, hgt: number, color: string) {
  for (let i = 0; i < hgt; i++) {
    const half = Math.floor(((hgt - i) / hgt) * hgt * 0.22) + (i % 3 === 0 ? 1 : 0)
    px(ctx, x - half, base - i, color, half * 2 + 1, 1)
  }
}

export function drawTitleScene(ctx: Ctx, w: number, h: number, seed = 5) {
  const r = rng(seed)

  // muted teal sky in flat bands
  const sky = ['#8dbcc8', '#98c4cf', '#a4cbd5', '#b0d3db', '#bfdbe0', '#cde3e5']
  const bandH = Math.ceil((h * 0.62) / sky.length)
  sky.forEach((c, i) => px(ctx, 0, i * bandH, c, w, bandH + 1))
  px(ctx, 0, sky.length * bandH, sky[sky.length - 1], w, h)

  // cloud bank behind the mountains (shadow pass, then the bright tops)
  const cloudY = (x: number) => h * (0.36 + 0.07 * Math.sin(x / 31 + seed) + 0.03 * Math.sin(x / 11))
  const cloudR = (x: number) => Math.round(h * (0.06 + 0.04 * (0.5 + 0.5 * Math.sin(x / 17 + seed * 2))))
  for (let x = -10; x < w + 10; x += 3) disc(ctx, x, cloudY(x) + 3, cloudR(x), '#d3dfe0')
  for (let x = -10; x < w + 10; x += 3) disc(ctx, x, cloudY(x), cloudR(x) - 1, '#f4f2ec')
  for (let x = Math.round(w * 0.08); x < w * 0.3; x += 2) disc(ctx, x, h * 0.14 + Math.sin(x / 6) * 2, 3, '#eef1ed')

  // far ridges fading into haze
  ridge(ctx, w, h, r, { base: 0.6, amp: 0.16, freq: 0.035, phase: seed, color: '#a5c3cb', jag: 0 })
  haze(ctx, w, h, 0.42, 0.62, 0.18)
  ridge(ctx, w, h, r, { base: 0.66, amp: 0.12, freq: 0.05, phase: seed + 2, color: '#8eb0ba', jag: 2, valley: [TITLE.castleX, 0.12, 0.05] })
  haze(ctx, w, h, 0.5, 0.7, 0.12)

  // castle hill and castle
  const cx = Math.round(w * TITLE.castleX)
  const hillTop = Math.round(h * 0.5)
  const hw = w * 0.13
  for (let x = Math.round(cx - hw * 2.2); x < cx + hw * 2.2; x++) {
    const d = (x - cx) / hw
    const y = Math.round(hillTop + d * d * h * 0.07)
    if (y >= h) continue
    px(ctx, x, y, '#87a679', 1, h - y)
    px(ctx, x, y, '#9cba8a', 1, 1)
    if (r() > 0.8) px(ctx, x, y + 2 + Math.floor(r() * 14), '#759766')
  }
  drawCastle(ctx, cx, hillTop + 1, Math.round(h * 0.33))

  // mid and near ridges, opening into a valley below the castle
  ridge(ctx, w, h, r, { base: 0.74, amp: 0.1, freq: 0.06, phase: seed + 4, color: '#6f939c', jag: 3, valley: [TITLE.castleX, 0.1, 0.11] })
  haze(ctx, w, h, 0.62, 0.8, 0.07)
  ridge(ctx, w, h, r, { base: 0.86, amp: 0.08, freq: 0.08, phase: seed + 6, color: '#4f717a', jag: 4, valley: [TITLE.castleX + 0.02, 0.09, 0.06] })

  // winding path from the castle gate down toward the viewer
  for (let y = hillTop + 2; y < h; y++) {
    const t = (y - hillTop) / (h - hillTop)
    const x = cx + Math.sin(t * 7 + 0.5) * w * 0.025 * (0.4 + t) + t * w * 0.02
    const half = 0.6 + t * w * 0.012
    px(ctx, x - half - 1, y, '#bfb393', Math.round(half * 2 + 2), 1)
    px(ctx, x - half, y, '#ddd3b4', Math.max(1, Math.round(half * 2)), 1)
  }

  // dark pine silhouettes on the left (two depths)
  for (let x = -4; x < w * 0.3; x += 4 + Math.floor(r() * 5)) pine(ctx, x, h, Math.round(h * (0.22 + r() * 0.24)), '#2d4850')
  for (let x = -2; x < w * 0.2; x += 5 + Math.floor(r() * 5)) pine(ctx, x, h, Math.round(h * (0.12 + r() * 0.16)), '#22383f')

  // pines behind the ledge on the far right
  const lx = Math.round(w * TITLE.ledgeFrom)
  const ly = Math.round(h * TITLE.ledgeTop)
  for (let x = w - 2; x > w * 0.88; x -= 6 + Math.floor(r() * 6)) pine(ctx, x, ly + 2, Math.round(h * (0.2 + r() * 0.15)), '#2d4850')

  // rock ledge on the right where Jakov stands
  for (let x = lx; x < w; x++) {
    const t = (x - lx) / (w - lx)
    const edge = t < 0.08 ? Math.round((0.08 - t) * h * 1.6) : 0
    const y = ly + edge + (Math.sin(x / 5) > 0.7 ? 1 : 0)
    px(ctx, x, y, '#464b58', 1, h - y)
    px(ctx, x, y, '#6a7080', 1, 1)
    px(ctx, x, y + 1, '#575d6b', 1, 1)
    if (r() > 0.75) px(ctx, x, y + 3 + Math.floor(r() * (h - y)), '#3a3e4a', 2, 1)
    if (r() > 0.92) px(ctx, x, y + 3 + Math.floor(r() * (h - y)), '#5a606e')
    if (r() > 0.8 && edge === 0) px(ctx, x, y - 1, '#6b8a5e')
  }
}
