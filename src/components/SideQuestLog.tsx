import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useState } from 'react'
import Avatar from './Avatar'
import PixelIcon, { type IconName } from './PixelIcon'
import PromptBattle from './PromptBattle'
import Scene from './Scene'
import { Chest } from './Sprites'
import { sideQuests } from '../data/portfolio'
import { useGame } from '../lib/game'
import { playSfx } from '../lib/sound'

function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="pixel-box p-3 sm:p-5"
      aria-label={title}
    >
      <h2 className="mb-4 flex items-center gap-3 font-pixel text-2xl sm:text-3xl">
        <span className="frame-sm f-gold p-0.5">
          <PixelIcon name={icon} size={28} />
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

/** Bonus side quest page: one of my own projects where I applied prompting. */
export default function SideQuestLog({ id }: { id: number }) {
  const sq = sideQuests.find((q) => q.id === id)!
  const { go } = useGame()
  const [arrived, setArrived] = useState(false)
  const next = sideQuests.find((q) => q.id === id + 1)
  const prev = sideQuests.find((q) => q.id === id - 1)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [id])

  useEffect(() => {
    setArrived(false)
    const t = window.setTimeout(() => setArrived(true), 800)
    document.getElementById('side-title')?.focus({ preventScroll: true })
    return () => window.clearTimeout(t)
  }, [id])

  const goTo = (r: Parameters<typeof go>[0]) => {
    playSfx('click')
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    go(r)
  }

  const links = [...(sq.inputs ?? []).map((l) => ({ ...l, kind: 'input' as const })), ...sq.outputs.map((l) => ({ ...l, kind: 'output' as const }))]

  return (
    <main>
      <article className="mx-auto max-w-4xl space-y-6 px-3 py-5 sm:px-4" aria-labelledby="side-title">
        <button type="button" onClick={() => goTo({ screen: 'journey', section: 'side' })} className="pixel-btn-light">
          ◂ Side Quests
        </button>

        {/* header with scene banner */}
        <header className="frame f-wood drop">
          <Scene variant={sq.scene.variant} seed={80 + id} hills={0.45} grass={0.7} className="h-56 sm:h-72">
            <div className="absolute bottom-2 left-[8%] sm:left-[12%]">
              <Avatar pose={arrived ? sq.scene.pose : 'walk'} facing="right" size={150} label={`Jakov, ${sq.scene.pose} pose`} />
            </div>
            {arrived && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="frame-sm f-paper drop bubble-text absolute left-[44%] right-2 top-14 px-2 py-0.5 sm:left-[calc(12%+120px)] sm:right-auto sm:top-auto sm:bottom-[56%] sm:max-w-[55%]"
              >
                {sq.scene.line}
              </motion.div>
            )}
            <div className="absolute right-3 top-3">
              <span className="frame-sm f-blue px-2 font-pixel text-lg">BONUS SIDE QUEST {id}</span>
            </div>
          </Scene>
          <div className="bg-paper px-3 pb-3 pt-2 sm:px-4">
            <h1 id="side-title" tabIndex={-1} className="font-pixel text-3xl leading-tight focus:outline-none sm:text-4xl">
              {sq.title}
            </h1>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="frame-sm f-paper px-3 py-2">
                <dt className="pixel-label text-inksoft">Type</dt>
                <dd>{sq.type}</dd>
              </div>
              <div className="frame-sm f-paper px-3 py-2">
                <dt className="pixel-label text-inksoft">Tools</dt>
                <dd>{sq.platforms.join(', ')}</dd>
              </div>
            </dl>
          </div>
        </header>

        <Section icon="scrollb" title="Mission Briefing">
          <div className="space-y-3">
            {sq.briefing.map((p) => (
              <p key={p} className="reading">
                {p}
              </p>
            ))}
          </div>
        </Section>

        <Section icon="swords" title="Prompt Battle">
          <PromptBattle battle={sq.battle} />
        </Section>

        {links.length > 0 && (
          <Section icon="star" title="Loot: The Output">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="shrink-0 pt-1">
                <Chest open size={84} />
              </div>
              <ul className="grid w-full gap-3">
                {links.map((l) => (
                  <li key={l.url} className={`frame-sm px-3 py-2.5 ${l.kind === 'output' ? 'f-gold' : 'f-paper'}`}>
                    <p className="pixel-label text-inksoft">{l.kind === 'output' ? 'Result' : 'Input I gave the AI'}</p>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-pixel text-xl text-lanyard underline-offset-4 hover:underline"
                    >
                      {l.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    {l.note && <p className="mt-1 text-sm">{l.note}</p>}
                    <p className="mt-1 break-all text-xs text-inksoft">{l.url}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        <Section icon="gem" title="XP Gained">
          <ul className="grid gap-3 sm:grid-cols-2">
            {sq.xp.map((x, i) => (
              <li key={x} className="frame-sm f-paper flex items-start gap-2 px-3 py-2.5">
                <span className="shrink-0 pt-0.5">
                  <PixelIcon name="gem" size={20} accent={['#d6453d', '#3d6fb5', '#4f8f3a', '#9b5de5'][i % 4]} />
                </span>
                <span className="reading">{x}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div className="frame f-wood drop">
          <Scene variant="day" seed={90 + id} hills={0.4} grass={0.66} clouds={false} className="h-56 sm:h-64">
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <Avatar pose="victory" size={120} label="Jakov celebrating" />
            </div>
            <div className="absolute left-1/2 top-4 -translate-x-1/2">
              <span className="frame f-gold drop block whitespace-nowrap px-3 font-pixel text-3xl text-lanyard sm:text-4xl">SIDE QUEST CLEAR!</span>
            </div>
          </Scene>
          <div className="flex flex-wrap justify-center gap-3 bg-paper p-3">
            {prev && (
              <button type="button" className="pixel-btn-light" onClick={() => goTo({ screen: 'side', id: prev.id })}>
                ◂ Side Quest {prev.id}
              </button>
            )}
            <button type="button" className="pixel-btn-light" onClick={() => goTo({ screen: 'journey', section: 'map' })}>
              Return to Map
            </button>
            {next ? (
              <button type="button" className="pixel-btn" onClick={() => goTo({ screen: 'side', id: next.id })}>
                Next: Side Quest {next.id} ▸
              </button>
            ) : (
              <button type="button" className="pixel-btn-gold" onClick={() => goTo({ screen: 'summary' })}>
                Level Up Summary ▸
              </button>
            )}
          </div>
        </div>
      </article>
    </main>
  )
}
