// Tiny 8-bit sound effects made with the Web Audio API (no audio files).
let ctx: AudioContext | null = null
let enabled = false

export function setSoundEnabled(on: boolean) {
  enabled = on
}

type Sfx = 'click' | 'open' | 'complete' | 'step'

const PATTERNS: Record<Sfx, Array<[number, number]>> = {
  click: [[660, 0.05]],
  step: [[330, 0.03]],
  open: [
    [523, 0.06],
    [784, 0.08],
  ],
  complete: [
    [523, 0.08],
    [659, 0.08],
    [784, 0.08],
    [1047, 0.16],
  ],
}

export function playSfx(kind: Sfx) {
  if (!enabled) return
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
    }
    let t = ctx.currentTime
    for (const [freq, dur] of PATTERNS[kind]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.05, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + dur)
      t += dur
    }
  } catch {
    /* audio not available: stay silent */
  }
}
