import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import Avatar, { type Pose } from './Avatar'
import PixelCanvas from './PixelCanvas'
import { quests, titleScreen } from '../data/portfolio'
import { useGame, type Route } from '../lib/game'
import { playSfx } from '../lib/sound'
import { TITLE, drawTitleScene } from '../lib/titleScene'

interface Item {
  label: string
  hint: string
  action: () => void
}

/** Drifting fireflies / dust motes for atmosphere. */
function Fireflies({ count = 18 }: { count?: number }) {
  const flies = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 53) % 100,
        top: 30 + ((i * 37) % 62),
        size: i % 3 === 0 ? 4 : 3,
        dur: 5 + (i % 5) * 1.3,
        delay: -((i * 0.9) % 6),
      })),
    [count],
  )
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {flies.map((f, i) => (
        <span
          key={i}
          className="firefly absolute"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    on() // re-measure after mount in case the size changed before the listener existed
    window.addEventListener('resize', on)
    window.visualViewport?.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      window.visualViewport?.removeEventListener('resize', on)
    }
  }, [])
  return vp
}

export default function TitleScreen() {
  const { go, visited, completed, level, sound, toggleSound, resetProgress } = useGame()
  const reduce = useReducedMotion()
  const { w, h } = useViewport()
  const [started, setStarted] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [pose, setPose] = useState<Pose>('back')
  const startBtn = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const hasSave = visited.length > 0

  const narrow = w < 768
  const avatarH = Math.round(Math.min(narrow ? h * 0.19 : h * 0.44, narrow ? 160 : 360))

  const travel = (r: Route) => {
    playSfx('open')
    setPose('victory')
    window.setTimeout(() => go(r), reduce ? 0 : 500)
  }

  const items: Item[] = [
    ...(hasSave
      ? [
          {
            label: 'Continue',
            hint: `Save file: Prompting Lv.${level}, ${completed.length}/${quests.length} quests complete`,
            action: () => travel({ screen: 'journey', section: 'map' }),
          },
        ]
      : []),
    {
      label: 'New Game',
      hint: hasSave ? 'Start over from the Character Sheet (clears your progress)' : 'Begin the journey at the Character Sheet',
      action: () => {
        if (hasSave) resetProgress()
        travel({ screen: 'journey', section: 'character' })
      },
    },
    { label: 'Quest Map', hint: 'Jump straight to the World Map', action: () => travel({ screen: 'journey', section: 'map' }) },
    { label: 'Level Up Summary', hint: 'See how my prompting changed overall', action: () => travel({ screen: 'summary' }) },
    { label: `Sound: ${sound ? 'On' : 'Off'}`, hint: 'Optional 8-bit sound effects', action: toggleSound },
  ]

  useEffect(() => {
    if (!started) startBtn.current?.focus({ preventScroll: true })
    else itemRefs.current[0]?.focus({ preventScroll: true })
  }, [started])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        playSfx('step')
        setCursor((c) => {
          const n = (c + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
          itemRefs.current[n]?.focus()
          return n
        })
      }
      if (e.key === 'Escape') {
        setStarted(false)
        setPose('back')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const start = () => {
    playSfx('open')
    setStarted(true)
    setPose('happy')
  }

  return (
    <main className="relative h-[100svh] min-h-[560px] overflow-hidden bg-[#8dbcc8]">
      {/* painted valley + castle */}
      <div className="absolute inset-0">
        <PixelCanvas draw={(ctx, cw, ch) => drawTitleScene(ctx, cw, ch, 5)} />
      </div>
      <Fireflies />
      {/* mood: soft dark edges and a darker left side behind the menu */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, rgba(20,32,38,0.55) 0%, rgba(20,32,38,0.25) 34%, rgba(20,32,38,0) 55%), radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(16,26,32,0.45) 100%)',
        }}
      />

      {/* Jakov on the ledge (right side) */}
      <div
        className="absolute z-10"
        style={{ right: narrow ? '4%' : '9%', bottom: `${(1 - TITLE.ledgeTop) * 100}%`, marginBottom: -avatarH * 0.01 }}
      >
        <div className="relative">
          <Avatar
            pose={pose}
            size={avatarH}
            label="Jakov's avatar: glasses, black middle-part hair, light blue polo, red lanyard with ID, black pants"
          />
          <AnimatePresence>
            {started && !narrow && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.25 }}
                className="frame-sm f-paper drop absolute right-[75%] top-[2%] w-max max-w-[200px] px-2 py-1"
              >
                <p className="bubble-text">Hi! I'm Jakov. Ready for a quest?</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logo + menu (left side) */}
      <div className="relative z-20 flex h-full max-w-xl flex-col px-5 pb-5 pt-[7vh] sm:px-10 md:pl-[6vw]">
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 110, damping: 14 }}>
          <p className="font-pixel text-lg text-[#e9f1ee] title-shadow-sm sm:text-xl">~ A PDC10 Adventure ~</p>
          <h1 className="logo-text font-pixel leading-[0.85]">
            <span className="block text-6xl sm:text-8xl lg:text-9xl">Prompt</span>
            <span className="block text-6xl sm:text-8xl lg:text-9xl">Quest</span>
          </h1>
          <p className="mt-3 font-pixel text-2xl text-gold title-shadow-sm sm:text-3xl">{titleScreen.subtitleLine}</p>
        </motion.div>

        <div className="mt-[6vh] sm:mt-[8vh]">
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div key="start" exit={{ opacity: 0, x: -20 }}>
                <button ref={startBtn} type="button" onClick={start} className="menu-item text-4xl sm:text-5xl">
                  <span className="blink-text">▶ Press Start</span>
                </button>
              </motion.div>
            ) : (
              <motion.nav
                key="menu"
                aria-label="Title menu"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              >
                <ul className="space-y-1">
                  {items.map((it, i) => (
                    <li key={it.label}>
                      <button
                        ref={(el) => (itemRefs.current[i] = el)}
                        type="button"
                        onClick={() => {
                          playSfx('click')
                          it.action()
                        }}
                        onFocus={() => setCursor(i)}
                        onMouseEnter={() => setCursor(i)}
                        aria-current={cursor === i ? 'true' : undefined}
                        className={`menu-item flex items-center gap-2 text-2xl focus:outline-none sm:gap-3 sm:text-4xl ${cursor === i ? 'is-active' : ''}`}
                      >
                        <span className={`w-6 text-gold ${cursor === i ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
                          ▶
                        </span>
                        <span className="transition-transform duration-150" style={{ transform: cursor === i ? 'translateX(6px)' : 'none' }}>
                          {it.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {/* fixed height so hovering never resizes the menu (prevents jitter) */}
                <p className="mt-3 h-[2.75rem] max-w-[60%] overflow-hidden pl-9 sm:max-w-sm text-sm leading-5 text-[#e9f1ee] title-shadow-sm" aria-live="polite">
                  {items[cursor]?.hint}
                </p>
                <p className="hidden pl-9 text-xs text-[#d6e2df] title-shadow-sm [@media(min-height:720px)]:block">↑ ↓ choose · Enter select · Esc back</p>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-auto max-w-[60%] text-xs text-[#e9f1ee] title-shadow-sm sm:max-w-none sm:text-sm">{titleScreen.tagline}</p>
      </div>
    </main>
  )
}
