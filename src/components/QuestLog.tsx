import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Avatar, { AvatarPortrait } from './Avatar'
import PixelIcon, { type IconName } from './PixelIcon'
import PromptBattle from './PromptBattle'
import Scene from './Scene'
import { Chest, Confetti, PartyBadge } from './Sprites'
import { DungeonProgress, FrameworkSelector, LockRow, OrganizeDemo, Rulebook } from './Specials'
import { questScenes, quests, type Quest, type WalkthroughBlock } from '../data/portfolio'
import { useGame } from '../lib/game'
import { playSfx } from '../lib/sound'

function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  const id = `sec-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="pixel-box p-3 sm:p-5"
      aria-labelledby={id}
    >
      <h2 id={id} className="mb-4 flex items-center gap-3 font-pixel text-2xl font-bold sm:text-3xl">
        <span className="frame-sm f-gold p-0.5">
          <PixelIcon name={icon} size={28} />
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

function Block({ b }: { b: WalkthroughBlock }) {
  return (
    <div className="frame-sm f-paper">
      <h3 className="mb-2 flex items-center gap-2 font-semibold">
        <span className="inline-block h-2 w-2 bg-lanyard" aria-hidden="true" />
        {b.heading}
      </h3>
      {b.body && <p className="reading">{b.body}</p>}
      {b.table && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] border-2 border-ink text-left text-sm">
            <thead className="bg-ink text-cream">
              <tr>
                {b.table.columns.map((c) => (
                  <th key={c} scope="col" className="p-2 font-pixel text-base font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.table.rows.map((row, i) => (
                <tr key={i} className="border-t-2 border-ink/30 odd:bg-parchment/60">
                  {row.map((cell, j) =>
                    j === 0 ? (
                      <th key={j} scope="row" className="p-2 align-top font-semibold">
                        {cell}
                      </th>
                    ) : (
                      <td key={j} className="p-2 align-top">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {b.bullets && (
        <ul className="reading mt-2 space-y-1">
          {b.bullets.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-wood" aria-hidden="true" />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Special({ quest }: { quest: Quest }) {
  const title = (t: string) => <h3 className="mb-3 font-pixel text-xl font-bold text-lanyard">{t}</h3>
  switch (quest.special) {
    case 'frameworks':
      return (
        <div className="mt-5">
          {title('Framework Selector')}
          <FrameworkSelector />
        </div>
      )
    case 'dungeon':
      return (
        <div className="mt-5">
          {title('Dungeon Map: 6 levels + Final Boss')}
          <DungeonProgress />
        </div>
      )
    case 'locks':
      return (
        <div className="mt-5">
          {title('The Six Locks')}
          <LockRow />
        </div>
      )
    case 'agent':
      return (
        <div className="mt-5 space-y-4">
          {title('Try it: the ORGANIZE INBOX flow')}
          <OrganizeDemo />
          <Rulebook />
        </div>
      )
    default:
      return null
  }
}

function Loot({ xp }: { xp: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const open = useInView(ref, { once: true, amount: 0.5 })
  useEffect(() => {
    if (open) playSfx('open')
  }, [open])
  return (
    <div ref={ref} className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="shrink-0 pt-2">
        <Chest open={open} size={96} />
      </div>
      <ul className="grid w-full gap-3 sm:grid-cols-2">
        {xp.map((x, i) => (
          <motion.li
            key={x}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={open ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.25 + i * 0.15, type: 'spring', stiffness: 220, damping: 16 }}
            className="frame-sm f-paper flex items-start gap-2"
          >
            <span className="shrink-0 pt-0.5">
              <PixelIcon name="gem" size={20} accent={['#d6453d', '#3d6fb5', '#4f8f3a', '#9b5de5'][i % 4]} />
            </span>
            <span className="reading">{x}</span>
            <span className="ml-auto shrink-0 font-pixel text-sm font-bold text-lanyard">+XP</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

export default function QuestLog({ id }: { id: number }) {
  const quest = quests.find((q) => q.id === id)!
  const scene = questScenes[id]
  const { go, complete, completed, visit } = useGame()
  const reduce = useReducedMotion()
  const article = useRef<HTMLElement>(null)
  const stamp = useRef<HTMLDivElement>(null)
  const stampSeen = useInView(stamp, { once: true, amount: 0.6 })
  const { scrollYProgress } = useScroll({ target: article, offset: ['start start', 'end end'] })
  const xp = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  const [arrived, setArrived] = useState(false)
  const [hudH, setHudH] = useState(60)
  const next = quests.find((q) => q.id === id + 1)
  const prev = quests.find((q) => q.id === id - 1)

  // Keep the XP bar right under the HUD, whose height changes when it wraps on phones.
  useEffect(() => {
    const hud = document.querySelector('header')
    if (!hud) return
    const ro = new ResizeObserver(() => setHudH(hud.getBoundingClientRect().height))
    ro.observe(hud)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    visit(id)
    setArrived(false)
    const t = window.setTimeout(() => setArrived(true), reduce ? 0 : 900)
    document.getElementById('quest-title')?.focus({ preventScroll: true })
    return () => window.clearTimeout(t)
  }, [id, visit, reduce])

  useEffect(() => {
    if (stampSeen) complete(id)
  }, [stampSeen, id, complete])

  const goTo = (r: Parameters<typeof go>[0]) => {
    playSfx('click')
    go(r)
  }

  const done = completed.includes(id)
  const dark = scene.variant === 'night' || scene.variant === 'cave'

  return (
    <main>
      {/* XP bar fills as you scroll the quest */}
      <div className="sticky z-30 px-2" style={{ top: hudH }}>
        <div className="frame-sm f-wood mx-auto flex max-w-4xl items-center gap-2 px-2 py-0.5">
          <span className="font-pixel text-base font-bold text-lanyard">XP</span>
          <div className="frame-sm f-dark h-5 flex-1 p-0" aria-hidden="true">
            <motion.div className="h-full origin-left bg-gradient-to-r from-gold to-lanyard" style={{ scaleX: xp }} />
          </div>
          <span className="font-pixel text-base font-bold">Quest {id}/7</span>
        </div>
      </div>

      <article ref={article} className="mx-auto max-w-4xl space-y-6 px-3 py-5 sm:px-4" aria-labelledby="quest-title">
        <button type="button" onClick={() => goTo({ screen: 'journey', section: 'map' })} className="pixel-btn-light">
          ◂ World Map
        </button>

        {/* a. Quest header: scene banner */}
        <header className="frame f-wood drop">
          <Scene variant={scene.variant} seed={30 + id} hills={0.45} grass={0.7} className="h-56 sm:h-72">
            <div className="absolute bottom-2 left-[8%] sm:left-[12%]">
              <Avatar pose={arrived ? scene.pose : 'walk'} facing="right" size={reduce ? 150 : 150} label={`Jakov, ${scene.pose} pose`} />
            </div>
            <AnimatePresence>
              {arrived && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="frame-sm f-paper drop absolute left-[44%] right-2 top-14 px-2 py-1 text-sm sm:left-[calc(12%+120px)] sm:right-auto sm:top-auto sm:bottom-[56%] sm:max-w-[55%] sm:text-base"
                >
                  {scene.line}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute right-3 top-3">
              <span className={`frame-sm px-2 font-pixel text-lg font-bold ${done ? 'f-gold' : 'f-red text-white'}`}>
                {id === 7 ? 'FINAL QUEST' : `QUEST ${id}`}
                {done && ' ★ CLEAR'}
              </span>
            </div>
            {dark && <span className="sr-only">Night or cave scene</span>}
          </Scene>
          <div className="bg-paper px-3 pb-3 pt-2 sm:px-4">
            <h1 id="quest-title" tabIndex={-1} className="font-pixel text-3xl font-bold leading-tight focus:outline-none sm:text-4xl">
              {quest.title}
            </h1>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              {[
                ['Type', quest.type],
                ['Platform(s)', quest.platforms.join(', ')],
                ['Team', quest.team ? `${quest.team.name} (${quest.team.section})` : 'Solo quest'],
              ].map(([k, v]) => (
                <div key={k} className="frame-sm f-paper">
                  <dt className="pixel-label text-inksoft">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/* b. Mission briefing */}
        <Section icon="scrollb" title="Mission Briefing">
          <div className="space-y-3">
            {quest.briefing.map((p) => (
              <p key={p} className="reading">
                {p}
              </p>
            ))}
          </div>
        </Section>

        {/* c. Party and gear */}
        <Section icon="shield" title="Party and Gear">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="frame-sm f-paper">
              <h3 className="pixel-label mb-2 text-inksoft">Party</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-3">
                  <span className="frame-sm f-blue p-0">
                    <AvatarPortrait size={40} />
                  </span>
                  <span>
                    <span className="block font-semibold">Santos, Jakov Benedict B.</span>
                    <span className="text-xs text-inksoft">{quest.team ? 'Party member' : 'Solo hero'}</span>
                  </span>
                </li>
                {quest.team?.members
                  .filter((m) => !m.startsWith('Santos'))
                  .map((m) => (
                    <li key={m} className="flex items-center gap-3">
                      <PartyBadge name={m} />
                      <span>
                        <span className="block font-semibold">{m}</span>
                        <span className="text-xs text-inksoft">Party member</span>
                      </span>
                    </li>
                  ))}
              </ul>
              {quest.team && (
                <p className="mt-2 text-sm">
                  Team <b>{quest.team.name}</b>, {quest.team.section}
                </p>
              )}
            </div>
            <div className="frame-sm f-paper">
              <h3 className="pixel-label mb-2 text-inksoft">Gear</h3>
              <ul className="space-y-2">
                {quest.gear.map((g, i) => (
                  <li key={g} className="flex items-start gap-2">
                    <span className="shrink-0 pt-0.5">
                      <PixelIcon name={i === 0 ? 'swords' : 'gem'} size={18} accent="#3d6fb5" />
                    </span>
                    <span className="reading">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* d. Walkthrough */}
        <Section icon="map" title="Quest Walkthrough">
          {quest.stats && (
            <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quest.stats.map((s, i) => (
                <motion.li
                  key={s.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: 'spring' }}
                  className="frame-sm f-blue text-center"
                >
                  <p className="font-pixel text-2xl font-bold leading-tight">{s.value}</p>
                  <p className="mt-1 text-xs">{s.label}</p>
                </motion.li>
              ))}
            </ul>
          )}
          <div className="space-y-4">
            {quest.walkthrough.map((b) => (
              <Block key={b.heading} b={b} />
            ))}
          </div>
          <Special quest={quest} />
        </Section>

        {/* e. Prompt battle */}
        <Section icon="swords" title="Prompt Battle">
          <PromptBattle battle={quest.battle} />
        </Section>

        {/* f. Reflection */}
        <Section icon="mirror" title="Reflection">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="frame-sm f-stone">
              <div className="mb-2 flex items-center gap-2">
                <span className="frame-sm f-paper p-0">
                  <AvatarPortrait size={40} pose="thinking" />
                </span>
                <h3 className="font-pixel text-xl font-bold text-inksoft">Before this quest</h3>
              </div>
              <p className="reading">{quest.reflection.before}</p>
            </div>
            <div className="frame-sm f-gold">
              <div className="mb-2 flex items-center gap-2">
                <span className="frame-sm f-paper p-0">
                  <AvatarPortrait size={40} pose="happy" />
                </span>
                <h3 className="font-pixel text-xl font-bold">After this quest</h3>
              </div>
              <p className="reading">{quest.reflection.after}</p>
            </div>
          </div>
        </Section>

        {/* g. XP gained */}
        <Section icon="star" title="XP Gained">
          <Loot xp={quest.xp} />
        </Section>

        {/* h. Quest complete */}
        <div ref={stamp} className="frame f-wood drop">
          <Scene variant={scene.variant === 'cave' ? 'day' : scene.variant} seed={60 + id} hills={0.4} grass={0.66} clouds={false} className="h-64 sm:h-72">
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <div className="relative">
                {stampSeen && <Confetti />}
                <Avatar pose={stampSeen ? 'victory' : 'idle'} size={130} label="Jakov celebrating" />
              </div>
            </div>
            <motion.div
              initial={{ scale: 2, opacity: 0, rotate: -20 }}
              animate={stampSeen ? { scale: 1, opacity: 1, rotate: -6 } : {}}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="absolute left-1/2 top-4 -translate-x-1/2"
            >
              <span className="frame f-gold drop block whitespace-nowrap px-3 font-pixel text-3xl font-bold text-lanyard sm:text-4xl">
                QUEST COMPLETE!
              </span>
            </motion.div>
          </Scene>
          <div className="flex flex-wrap justify-center gap-3 bg-paper p-3">
            {prev && (
              <button type="button" className="pixel-btn-light" onClick={() => goTo({ screen: 'quest', id: prev.id })}>
                ◂ Quest {prev.id}
              </button>
            )}
            <button type="button" className="pixel-btn-light" onClick={() => goTo({ screen: 'journey', section: 'map' })}>
              Return to Map
            </button>
            {next ? (
              <button type="button" className="pixel-btn" onClick={() => goTo({ screen: 'quest', id: next.id })}>
                Next: Quest {next.id} ▸
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
