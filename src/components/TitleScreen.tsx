import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Avatar, { type Pose } from './Avatar'
import Scene from './Scene'
import { quests, titleScreen } from '../data/portfolio'
import { useGame, type Route } from '../lib/game'
import { playSfx } from '../lib/sound'

interface Item {
  label: string
  hint: string
  action: () => void
}

export default function TitleScreen() {
  const { go, visited, completed, level, sound, toggleSound, resetProgress } = useGame()
  const reduce = useReducedMotion()
  const [started, setStarted] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [pose, setPose] = useState<Pose>('adventure')
  const startBtn = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const hasSave = visited.length > 0

  const travel = (r: Route) => {
    playSfx('open')
    setPose('cheer')
    window.setTimeout(() => go(r), reduce ? 0 : 450)
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
      if (!started) {
        if (e.key === 'Enter' || e.key === ' ') return // the focused button handles it
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        playSfx('step')
        setCursor((c) => {
          const n = (c + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
          itemRefs.current[n]?.focus()
          return n
        })
      }
      if (e.key === 'Escape') setStarted(false)
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
    <main className="relative min-h-[100svh]">
      <Scene variant="day" path birds seed={6} hills={0.5} grass={0.64} className="absolute inset-0" />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center px-4 pb-6 pt-8 sm:pt-12">
        {/* Logo */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 110, damping: 12 }}
          className="text-center"
        >
          <p className="font-pixel text-lg font-semibold text-cream small-outline sm:text-xl">~ A PDC10 Adventure ~</p>
          <h1 className="mt-1 font-pixel font-bold leading-none">
            <span className="block whitespace-nowrap text-6xl text-gold title-outline sm:text-7xl md:text-8xl">{titleScreen.title}</span>
          </h1>
          <div className="frame-sm f-wood drop mx-auto mt-3 inline-block px-4 py-1">
            <span className="font-pixel text-lg font-semibold text-ink sm:text-2xl">{titleScreen.subtitleLine}</span>
          </div>
        </motion.div>

        {/* Hero on the path */}
        <div className="relative mt-auto flex w-full max-w-4xl items-end justify-center">
          <Avatar
            pose={pose}
            size={typeof window !== 'undefined' && window.innerWidth < 640 ? 170 : 230}
            label="Jakov's avatar: glasses, black middle-part hair, light blue polo, red lanyard with ID, black pants"
          />
          {!started && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="frame-sm f-paper drop absolute bottom-[52%] left-[calc(50%+70px)] z-10 hidden w-max max-w-[220px] px-3 py-2 sm:block"
            >
              <p className="bubble-text">Hi! I'm Jakov. Ready for a quest?</p>
            </motion.div>
          )}
        </div>

        {/* Start or menu */}
        <div className="mt-4 w-full max-w-md">
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div key="start" exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-3">
                <button ref={startBtn} type="button" onClick={start} className="pixel-btn-gold px-8 py-3 text-2xl sm:text-3xl">
                  <span className="blink-text">▶ PRESS START</span>
                </button>
                <p className="frame-sm f-paper px-3 py-1 text-center text-xs sm:text-sm">{titleScreen.tagline}</p>
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="pixel-box px-3 py-2"
              >
                <nav aria-label="Title menu">
                  <ul>
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
                          className="flex w-full items-center gap-2 px-2 py-1 text-left font-pixel text-xl font-semibold focus:outline-none sm:text-2xl"
                        >
                          <span className={`w-5 text-lanyard ${cursor === i ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
                            ▶
                          </span>
                          <span className={cursor === i ? 'text-lanyard' : ''}>{it.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                {/* Fixed two-line height so hovering items never resizes the menu (prevents hover jitter) */}
                <p
                  className="mt-1 h-[3.25rem] overflow-hidden border-t-2 border-dashed border-ink/30 px-2 pt-2 text-sm leading-5 text-inksoft"
                  aria-live="polite"
                >
                  {items[cursor]?.hint}
                </p>
                <p className="px-2 pb-1 text-xs text-inksoft">↑ ↓ to choose · Enter to select · Esc to go back</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
