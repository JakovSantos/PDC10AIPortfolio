import { motion, useReducedMotion } from 'framer-motion'

function Grid({ rows, colors, size, className = '' }: { rows: string[]; colors: Record<string, string>; size: number; className?: string }) {
  const w = rows[0].length
  const h = rows.length
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={size} height={(size * h) / w} className={`crisp ${className}`} aria-hidden="true">
      {rows.map((row, y) =>
        row.split('').map((ch, x) =>
          colors[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={colors[ch]} /> : null,
        ),
      )}
    </svg>
  )
}

/* ---------- "Vague Slime": the Lv. 1 prompt in the Prompt Battle ---------- */
const SLIME = [
  '....######....',
  '...#gggggg#...',
  '..#gwwgggggg#.',
  '.#gwgggggggg#.',
  '#gggggggggggg#',
  '#ggKggggggKgg#',
  '#ggKggggggKgg#',
  '#gggggggggggg#',
  '#gggggmmggggg#',
  '#dgggggggggdd#',
  '.#dddddddddd#.',
  '..##########..',
]
const SLIME_COLORS = { '#': '#22401c', g: '#8fd15a', w: '#e6ffc9', K: '#22401c', m: '#4f8f3a', d: '#5aa83e' }

export function Slime({ size = 72, ko = false }: { size?: number; ko?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      animate={
        reduce
          ? {}
          : ko
            ? { rotate: [0, -12, 10, -90], y: [0, -10, 0, 10], opacity: [1, 1, 1, 0.5] }
            : { scaleY: [1, 0.88, 1], scaleX: [1, 1.08, 1] }
      }
      transition={ko ? { duration: 0.7 } : { duration: 1.1, repeat: Infinity }}
      style={{ originY: 1 }}
    >
      <Grid rows={SLIME} colors={SLIME_COLORS} size={size} />
    </motion.div>
  )
}

/* ---------- treasure chest ---------- */
const CHEST_CLOSED = [
  '..##########..',
  '.#wwwwwwwwww#.',
  '#wbbbbbbbbbbw#',
  '#bbbbbbbbbbbb#',
  '##############',
  '#bbbbbggbbbbb#',
  '#bbbbbgybbbbb#',
  '#dbbbbggbbbbd#',
  '#dddddddddddd#',
  '##############',
]
const CHEST_OPEN = [
  '.#wwwwwwwwww#.',
  '#bbbbbbbbbbbb#',
  '##############',
  '#yyyyyyyyyyyy#',
  '#yywyyyyyywyy#',
  '#bbbbbggbbbbb#',
  '#bbbbbgybbbbb#',
  '#dbbbbggbbbbd#',
  '#dddddddddddd#',
  '##############',
]
const CHEST_COLORS = { '#': '#3a2717', w: '#e3a660', b: '#b8763a', d: '#7a4a22', g: '#c4861a', y: '#f2b632' }

export function Chest({ open, size = 84 }: { open: boolean; size?: number }) {
  return (
    <div className="relative">
      {open && (
        <span
          className="absolute inset-x-0 -top-3 mx-auto h-6 w-3/4 rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(255,233,160,0.95), rgba(255,233,160,0))' }}
          aria-hidden="true"
        />
      )}
      <Grid rows={open ? CHEST_OPEN : CHEST_CLOSED} colors={CHEST_COLORS} size={size} />
    </div>
  )
}

/* ---------- pixel confetti burst ---------- */
export function Confetti({ count = 18 }: { count?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  const colors = ['#d6453d', '#f2b632', '#7cc04b', '#a9c8ee', '#c9a2ff']
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        const dist = 80 + (i % 4) * 30
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2"
            style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 40, opacity: 0, rotate: 180 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

/* ---------- party member badge (teammates have no sprite) ---------- */
export function PartyBadge({ name }: { name: string }) {
  const initials = name
    .replace(/,.*/, '')
    .slice(0, 1)
    .concat((name.split(',')[1] || '').trim().slice(0, 1))
  return (
    <span className="frame-sm f-stone flex h-12 w-12 items-center justify-center p-0 font-pixel text-lg font-bold" aria-hidden="true">
      {initials}
    </span>
  )
}
