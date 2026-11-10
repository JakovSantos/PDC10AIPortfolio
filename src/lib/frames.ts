// Pixel-art frames for panels, buttons, and boxes.
//
// Each frame is painted as ONE background made of solid-colour rectangles
// (linear-gradient layers) inside a transparent border. Unlike CSS border-image,
// which draws 9 separate slices, a single background cannot split into a hairline
// gap when the element moves by a fraction of a pixel (e.g. on hover).
//
// Design: a 12x12 pixel frame with 4-pixel edges, scaled by `u` CSS px per pixel.
// .frame uses u = 3 (12px border), .frame-sm uses u = 2 (8px border).

interface FramePalette {
  outline: string
  light: string
  mid: string
  dark: string
  inner: string
  fill: string
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

// Axis spec in frame pixels: inset from the start (l/t), from the end (r/b), or a fixed size (w/h).
interface Axis {
  from?: number
  to?: number
  size?: number
}

function axis(a: Axis, u: number, start: string, end: string): [string, string] {
  if (a.from !== undefined && a.to !== undefined) return [`${start} ${a.from * u}px`, `calc(100% - ${(a.from + a.to) * u}px)`]
  if (a.from !== undefined) return [`${start} ${a.from * u}px`, `${(a.size ?? 1) * u}px`]
  return [`${end} ${(a.to ?? 0) * u}px`, `${(a.size ?? 1) * u}px`]
}

function rect(x: Axis, y: Axis, color: string, u: number) {
  const [px, sx] = axis(x, u, 'left', 'right')
  const [py, sy] = axis(y, u, 'top', 'bottom')
  return `linear-gradient(${color},${color}) ${px} ${py} / ${sx} ${sy} no-repeat border-box`
}

function frameBackground(p: FramePalette, u: number) {
  // Listed bottom-to-top, then reversed (CSS paints the first layer on top).
  const layers = [
    rect({ from: 1, to: 1 }, { from: 2, to: 2 }, p.mid, u),
    rect({ from: 2, to: 2 }, { from: 1, to: 1 }, p.mid, u),
    // bevel: light top/left, dark bottom/right
    rect({ from: 2, to: 2 }, { from: 1, size: 1 }, p.light, u),
    rect({ from: 1, size: 1 }, { from: 2, to: 3 }, p.light, u),
    rect({ from: 2, to: 2 }, { to: 1, size: 1 }, p.dark, u),
    rect({ to: 1, size: 1 }, { from: 3, to: 2 }, p.dark, u),
    // outline with stepped corners
    rect({ from: 2, to: 2 }, { from: 0, size: 1 }, p.outline, u),
    rect({ from: 2, to: 2 }, { to: 0, size: 1 }, p.outline, u),
    rect({ from: 0, size: 1 }, { from: 2, to: 2 }, p.outline, u),
    rect({ to: 0, size: 1 }, { from: 2, to: 2 }, p.outline, u),
    rect({ from: 1, size: 1 }, { from: 1, size: 1 }, p.outline, u),
    rect({ to: 1, size: 1 }, { from: 1, size: 1 }, p.outline, u),
    rect({ from: 1, size: 1 }, { to: 1, size: 1 }, p.outline, u),
    rect({ to: 1, size: 1 }, { to: 1, size: 1 }, p.outline, u),
    // inner groove, then the fill behind the content
    rect({ from: 3, to: 3 }, { from: 3, to: 3 }, p.inner, u),
    rect({ from: 4, to: 4 }, { from: 4, to: 4 }, p.fill, u),
  ]
  return layers.reverse().join(',')
}

export function installFrames() {
  const css: string[] = []
  for (const [name, pal] of Object.entries(FRAMES)) {
    css.push(`.frame.f-${name}{background:${frameBackground(pal, 3)}}`)
    css.push(`.frame-sm.f-${name}{background:${frameBackground(pal, 2)}}`)
  }
  // Component classes built with @apply in index.css (they don't carry .frame/.f-* themselves)
  const components: [string, string, number][] = [
    ['.pixel-box', 'wood', 3],
    ['.pixel-box-flat', 'paper', 2],
    ['.prompt-box', 'dark', 2],
    ['.pixel-btn', 'red', 2],
    ['.pixel-btn-light', 'paper', 2],
    ['.pixel-btn-gold', 'gold', 2],
  ]
  for (const [sel, name, u] of components) css.push(`${sel}{background:${frameBackground(FRAMES[name], u)}}`)
  // Map labels turn red while their quest node is hovered or focused
  css.push(`.group:hover .frame-sm.hover-red,.group:focus-visible .frame-sm.hover-red{background:${frameBackground(FRAMES.red, 2)}}`)
  const style = document.createElement('style')
  style.id = 'pixel-frames'
  style.textContent = css.join('\n')
  document.head.appendChild(style)
}
