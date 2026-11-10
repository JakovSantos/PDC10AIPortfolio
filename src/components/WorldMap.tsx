import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Avatar, { type Facing, type Pose } from './Avatar'
import DialogBox from './DialogBox'
import PixelCanvas from './PixelCanvas'
import PixelIcon from './PixelIcon'
import { Plaque } from './CharacterSheet'
import { mapIntro, quests } from '../data/portfolio'
import { useGame } from '../lib/game'
import { playSfx } from '../lib/sound'
import { useMedia } from '../hooks/useMedia'
import { drawMap } from '../lib/pixelArt'

// Node positions in map units. Index 0 is the starting camp.
const WIDE = {
  w: 100,
  h: 56,
  points: [
    [5, 50],
    [15, 33],
    [29, 44],
    [41, 22],
    [55, 39],
    [67, 17],
    [79, 35],
    [92, 14],
  ],
}
const TALL = {
  w: 100,
  h: 170,
  points: [
    [78, 160],
    [28, 140],
    [70, 119],
    [28, 97],
    [70, 75],
    [28, 53],
    [70, 33],
    [46, 13],
  ],
}

// Remember where the avatar stands between visits to the map.
let lastNode = 0

function Flag({ state }: { state: 'new' | 'seen' | 'done' }) {
  const color = state === 'done' ? '#f2b632' : state === 'seen' ? '#d6453d' : '#fff6e0'
  return (
    <svg viewBox="0 0 7 10" width={21} height={30} className="crisp absolute -right-3 -top-6" aria-hidden="true">
      <rect x="0" y="0" width="1" height="10" fill="#3a2717" />
      <rect x="1" y="0" width="5" height="1" fill="#3a2717" />
      <rect x="1" y="4" width="5" height="1" fill="#3a2717" />
      <rect x="6" y="1" width="1" height="3" fill="#3a2717" />
      <rect x="1" y="1" width="5" height="3" fill={color} />
      {state === 'done' && <rect x="3" y="2" width="1" height="1" fill="#fff6c9" />}
    </svg>
  )
}

export default function WorldMap() {
  const { go, visit, visited, completed, level } = useGame()
  const reduce = useReducedMotion()
  const wide = useMedia('(min-width: 768px)')
  const layout = wide ? WIDE : TALL
  const toPct = (p: number[]) => ({ left: `${(p[0] / layout.w) * 100}%`, top: `${(p[1] / layout.h) * 100}%` })

  const [at, setAt] = useState(lastNode)
  const [target, setTarget] = useState<number | null>(null)
  const [pose, setPose] = useState<Pose>('idle')
  const [facing, setFacing] = useState<Facing>('right')
  const busy = target !== null
  const timer = useRef<number>()
  const arrived = useRef(true)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Keyframes along the path from `at` to `target`
  let keyLeft: string[] = [toPct(layout.points[at]).left]
  let keyTop: string[] = [toPct(layout.points[at]).top]
  if (target !== null && target !== at) {
    const step = target > at ? 1 : -1
    const seq: number[] = []
    for (let i = at; i !== target + step; i += step) seq.push(i)
    keyLeft = seq.map((i) => toPct(layout.points[i]).left)
    keyTop = seq.map((i) => toPct(layout.points[i]).top)
  }
  const steps = target === null ? 0 : Math.abs(target - at)
  const walkTime = reduce ? 0 : Math.min(0.5 * steps, 2.8)

  const arrive = (node: number) => {
    if (arrived.current) return
    arrived.current = true
    window.clearTimeout(timer.current)
    lastNode = node
    setAt(node)
    setTarget(null)
    setPose('cheer')
    playSfx('open')
    visit(node)
    timer.current = window.setTimeout(
      () => {
        setPose('idle')
        go({ screen: 'quest', id: node })
      },
      reduce ? 150 : 800,
    )
  }

  const openQuest = (node: number) => {
    if (busy) return
    playSfx('click')
    arrived.current = false
    if (node === at || reduce) {
      arrive(node)
      return
    }
    // face the overall direction of travel
    const [ax, ay] = layout.points[at]
    const [bx, by] = layout.points[node]
    const dx = bx - ax
    const dy = by - ay
    setFacing(Math.abs(dy) > Math.abs(dx) * 1.3 ? (dy < 0 ? 'up' : 'down') : dx < 0 ? 'left' : 'right')
    setTarget(node)
    setPose('walk')
    // Fallback in case the animation callback never fires (e.g. a background tab)
    const ms = Math.min(0.5 * Math.abs(node - at), 2.8) * 1000 + 400
    timer.current = window.setTimeout(() => arrive(node), ms)
  }

  const avatarH = wide ? 78 : 60

  return (
    <section id="map" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8" aria-labelledby="map-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Plaque id="map-title">World Map</Plaque>
        <div className="frame-sm f-wood drop flex items-center gap-2 px-2 py-1">
          <span className="frame-sm f-gold px-1.5 font-pixel text-lg font-bold leading-tight">Prompting Lv.{level}</span>
          <div className="flex gap-1" aria-label={`${visited.length} of 7 quests visited`}>
            {quests.map((q) => (
              <svg key={q.id} viewBox="0 0 5 5" width={18} height={18} className="crisp" aria-hidden="true">
                <rect x="0" y="0" width="5" height="5" fill="#3a2717" />
                <rect x="1" y="1" width="3" height="3" fill={completed.includes(q.id) ? '#f2b632' : visited.includes(q.id) ? '#d6453d' : '#fff6e0'} />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <DialogBox speaker="JAKOV" portrait="adventure" text={mapIntro} className="mb-6" />

      <div className="frame f-wood drop">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${layout.w / layout.h}` }}>
          <PixelCanvas
            deps={[wide]}
            draw={(ctx, w, h) =>
              drawMap(
                ctx,
                w,
                h,
                layout.points.map(([x, y]) => [(x / layout.w) * w, (y / layout.h) * h] as [number, number]),
                wide ? 11 : 13,
              )
            }
          />

          {/* start camp */}
          <div
            className="frame-sm f-plank absolute px-1 font-pixel text-sm font-bold leading-tight text-cream"
            style={{ ...toPct(layout.points[0]), transform: 'translate(-50%, 14px)' }}
          >
            START
          </div>

          {/* quest landmarks */}
          <ol className="contents">
            {quests.map((q) => {
              const pos = toPct(layout.points[q.id])
              const done = completed.includes(q.id)
              const seen = visited.includes(q.id)
              return (
                <li key={q.id} className="contents">
                  <motion.button
                    type="button"
                    onClick={() => openQuest(q.id)}
                    disabled={busy}
                    whileHover={reduce ? undefined : { y: -6 }}
                    whileFocus={reduce ? undefined : { y: -6 }}
                    className={`group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ${busy ? 'cursor-wait' : ''}`}
                    style={pos}
                    aria-label={`Quest ${q.id}: ${q.shortTitle}${done ? ', completed' : seen ? ', visited' : ''}`}
                  >
                    <span
                      className={`frame-sm relative transition-[filter] group-hover:[filter:drop-shadow(0_0_8px_rgba(255,236,150,1))] group-focus-visible:[filter:drop-shadow(0_0_8px_rgba(255,236,150,1))] ${
                        q.id === 7 || done ? 'f-gold' : 'f-stone'
                      } ${!seen && !reduce ? 'float' : ''}`}
                    >
                      <PixelIcon name={q.icon} size={wide ? 32 : 24} />
                      <Flag state={done ? 'done' : seen ? 'seen' : 'new'} />
                    </span>
                    <span className="frame-sm f-plank mt-0.5 whitespace-nowrap px-1 font-pixel text-sm leading-tight text-cream sm:text-base">
                      {/* phones show the short label; full names are in the quest list below the map */}
                      {wide ? `${q.id}. ${q.shortTitle}` : `Quest ${q.id}`}
                    </span>
                  </motion.button>
                </li>
              )
            })}
          </ol>

          {/* the walking avatar */}
          <motion.div
            className="pointer-events-none absolute z-20"
            initial={false}
            animate={{ left: keyLeft, top: keyTop }}
            transition={{ duration: walkTime, ease: 'linear' }}
            onAnimationComplete={() => {
              if (target !== null) arrive(target)
            }}
            style={{ x: target !== null ? '-50%' : '-115%', y: '-78%' }}
          >
            <Avatar pose={pose} size={avatarH} facing={pose === 'walk' ? facing : 'right'} />
          </motion.div>
        </div>
      </div>

      <p className="frame-sm f-paper mt-3 inline-block text-sm">
        Tip: Tab moves between quests, Enter opens one. Flags turn <b className="text-lanyard">red</b> when visited and{' '}
        <b className="text-[#9a6a08]">gold</b> when completed.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Quest list">
        {quests.map((q) => (
          <li key={q.id}>
            <button
              type="button"
              onClick={() => openQuest(q.id)}
              disabled={busy}
              className="frame-sm f-paper flex w-full items-center gap-3 text-left transition-transform hover:-translate-y-1"
            >
              <PixelIcon name={q.icon} size={26} />
              <span>
                <span className="block font-pixel text-sm font-bold text-lanyard">
                  Quest {q.id}
                  {completed.includes(q.id) ? ' ★' : ''}
                </span>
                <span className="text-sm font-semibold">{q.shortTitle}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
