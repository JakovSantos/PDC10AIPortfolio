// Pixel-art 9-slice frames (12x12 SVG, 4px edges) exposed as CSS variables
// so every panel, button, and box shares the same 16-bit RPG look.

interface FramePalette {
  outline: string
  light: string
  mid: string
  dark: string
  inner: string
  fill: string
}

function frame(p: FramePalette) {
  const r = (x: number, y: number, w: number, h: number, c: string) =>
    `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${c}'/>`
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' shape-rendering='crispEdges'>` +
    // body (cross shape keeps the corners cut)
    r(1, 2, 10, 8, p.mid) +
    r(2, 1, 8, 10, p.mid) +
    // bevel: light top/left, dark bottom/right
    r(2, 1, 8, 1, p.light) +
    r(1, 2, 1, 7, p.light) +
    r(2, 10, 8, 1, p.dark) +
    r(10, 3, 1, 7, p.dark) +
    // outline with stepped corners
    r(2, 0, 8, 1, p.outline) +
    r(2, 11, 8, 1, p.outline) +
    r(0, 2, 1, 8, p.outline) +
    r(11, 2, 1, 8, p.outline) +
    r(1, 1, 1, 1, p.outline) +
    r(10, 1, 1, 1, p.outline) +
    r(1, 10, 1, 1, p.outline) +
    r(10, 10, 1, 1, p.outline) +
    // inner groove
    r(3, 3, 6, 6, p.inner) +
    // fill
    r(4, 4, 4, 4, p.fill) +
    `</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const FRAMES: Record<string, FramePalette> = {
  wood: { outline: '#3a2717', light: '#e3a660', mid: '#b8763a', dark: '#7a4a22', inner: '#5e3a1e', fill: '#fdf3d8' },
  plank: { outline: '#3a2717', light: '#e3a660', mid: '#b8763a', dark: '#7a4a22', inner: '#9a6230', fill: '#9a6230' },
  paper: { outline: '#6b4f3a', light: '#fffaf0', mid: '#f3dcae', dark: '#d9b77e', inner: '#c79f63', fill: '#fff9ea' },
  dark: { outline: '#17151f', light: '#5a5878', mid: '#3d3b55', dark: '#25233a', inner: '#17151f', fill: '#2d2b3d' },
  red: { outline: '#3a2717', light: '#f07b6e', mid: '#d6453d', dark: '#a8302a', inner: '#d6453d', fill: '#d6453d' },
  gold: { outline: '#3a2717', light: '#ffe7a1', mid: '#f2b632', dark: '#c4861a', inner: '#f2b632', fill: '#f2b632' },
  green: { outline: '#22401c', light: '#a8dc72', mid: '#7cc04b', dark: '#4f8f3a', inner: '#7cc04b', fill: '#7cc04b' },
  blue: { outline: '#1f3550', light: '#d3e6fb', mid: '#a9c8ee', dark: '#7a9fcf', inner: '#a9c8ee', fill: '#a9c8ee' },
  stone: { outline: '#2c2a33', light: '#c9c4d6', mid: '#9a94ab', dark: '#6c6680', inner: '#57526a', fill: '#ece7f5' },
}

export function installFrames() {
  const root = document.documentElement
  for (const [name, pal] of Object.entries(FRAMES)) root.style.setProperty(`--frame-${name}`, frame(pal))
}
