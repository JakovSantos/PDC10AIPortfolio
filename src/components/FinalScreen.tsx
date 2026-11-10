import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Avatar, { type Pose } from './Avatar'
import DialogBox from './DialogBox'
import Scene from './Scene'
import { Confetti } from './Sprites'
import { Plaque } from './CharacterSheet'
import { finalSummary, profile } from '../data/portfolio'
import { useGame } from '../lib/game'
import { playSfx } from '../lib/sound'

type Phase = 'ready' | 'walking' | 'done'

export default function FinalScreen() {
  const { go, level, completed } = useGame()
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('ready')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const levelUp = () => {
    playSfx('open')
    if (reduce) {
      setPhase('done')
      return
    }
    setPhase('walking')
    window.setTimeout(() => {
      playSfx('complete')
      setPhase('done')
    }, 1600)
  }

  const pose: Pose = phase === 'ready' ? 'chin' : phase === 'walking' ? 'walk' : 'victory'

  return (
    <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
      <div className="text-center">
        <Plaque>Level Up Summary</Plaque>
      </div>
      <p className="frame-sm f-paper mx-auto -mt-2 mb-6 block w-fit px-3 py-1 text-center text-sm">
        Prompting Lv.{level} · {completed.length} of 7 quests completed
      </p>

      {/* Level up stage */}
      <div className="frame f-wood drop">
        <Scene variant="sunset" seed={77} hills={0.42} grass={0.7} className="h-64 sm:h-80">
          <motion.div
            className="absolute bottom-3"
            initial={false}
            animate={{ left: phase === 'ready' ? '10%' : '62%' }}
            transition={{ duration: reduce ? 0 : 1.6, ease: 'linear' }}
          >
            <div className="relative">
              {phase === 'done' && <Confetti count={24} />}
              <Avatar pose={pose} facing="right" size={150} label={`Jakov, ${phase === 'done' ? 'celebrating' : 'thinking'}`} />
            </div>
          </motion.div>
          <AnimatePresence>
            {phase === 'done' && (
              <motion.p
                initial={{ scale: 0.3, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap font-pixel text-5xl font-bold text-gold title-outline sm:text-7xl"
              >
                LEVEL UP!
              </motion.p>
            )}
          </AnimatePresence>
          {phase === 'ready' && (
            <div className="absolute inset-x-0 top-6 flex justify-center">
              <button type="button" onClick={levelUp} className="pixel-btn-gold px-6 text-2xl sm:text-3xl">
                <span className="blink-text">▶ Level Up</span>
              </button>
            </div>
          )}
        </Scene>
      </div>

      <div className="mt-6 grid items-stretch gap-6 md:grid-cols-2">
        <div className="pixel-box p-3">
          <p className="font-pixel text-xl font-bold text-inksoft">{finalSummary.firstPromptLabel}</p>
          <div className="prompt-box mt-2">{finalSummary.firstPrompt}</div>
          <p className="mt-2 text-sm text-inksoft">Lv. 1: one line, no audience, no format.</p>
        </div>
        <div className="pixel-box p-3">
          <p className="font-pixel text-xl font-bold text-lanyard">{finalSummary.strongestPromptLabel}</p>
          <AnimatePresence mode="wait">
            {phase === 'done' ? (
              <motion.div
                key="after"
                initial={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 160, damping: 16 }}
                className="prompt-box mt-2"
              >
                {finalSummary.strongestPrompt}
              </motion.div>
            ) : (
              <motion.div key="hidden" exit={{ opacity: 0 }} className="prompt-box mt-2 flex min-h-[9rem] items-center justify-center text-center">
                <span className="font-pixel text-lg text-cream/80">🔒 Press "Level Up" to reveal</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="closing-title">
        <h2 id="closing-title" className="sr-only">
          Closing Reflection
        </h2>
        <DialogBox speaker="JAKOV" portrait="happy" text={finalSummary.closing.join(' ')} speed={14} />
      </section>

      {/* Credits */}
      <section className="frame f-dark drop mt-10" aria-labelledby="credits-title">
        <Scene variant="night" seed={88} hills={0.62} grass={0.82} className="min-h-[34rem]">
          <div className="relative z-10 px-4 py-10 text-center text-cream">
            <h2 id="credits-title" className="font-pixel text-4xl font-bold text-gold small-outline">
              ~ Credits ~
            </h2>
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="mt-6 space-y-5"
            >
              {[
                ['HERO', profile.name],
                ['CLASS', `${profile.section} · ${profile.className}`],
                ['COURSE', profile.course],
                ['PARTY MEMBERS (QUESTS 5 & 6)', 'Calaguas, Bryan V. · Miranda, Princess Allyssa D.'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="font-pixel text-base font-bold text-gold">{k}</p>
                  <p className="mt-1 font-semibold small-outline">{v}</p>
                </div>
              ))}
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="frame-sm f-blue inline-block px-2 font-pixel text-lg font-bold text-ink"
              >
                Connect on LinkedIn ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </motion.div>
            <p className="mt-10 font-pixel text-3xl font-bold text-cream small-outline">THANK YOU FOR PLAYING!</p>
            <button
              type="button"
              onClick={() => {
                playSfx('open')
                go({ screen: 'title' })
              }}
              className="pixel-btn mt-5 px-5 text-2xl"
            >
              ↺ Play Again
            </button>
          </div>
        </Scene>
      </section>
    </main>
  )
}
