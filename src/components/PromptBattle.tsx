import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Avatar from './Avatar'
import { Slime } from './Sprites'
import { TAG_INFO, type PromptBattle as Battle, type Tag } from '../data/portfolio'
import { playSfx } from '../lib/sound'
import { useGame } from '../lib/game'

type View = 'before' | 'vs' | 'after'

function TagChip({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-block border-2 border-ink px-1.5 font-pixel text-sm font-semibold text-ink shadow-[2px_2px_0_0_#3a2717]"
      style={{ background: TAG_INFO[tag].color }}
    >
      {TAG_INFO[tag].label}
    </span>
  )
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between font-pixel text-sm font-semibold">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="frame-sm f-dark h-6 p-0">
        <motion.div
          className="h-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value === 0 ? 0 : Math.max(6, Math.min(100, (value / max) * 100))}%` }}
          transition={{ duration: 0.9, delay: 0.2 }}
        />
      </div>
    </div>
  )
}

function words(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length
}

function BeforePanel({ battle }: { battle: Battle }) {
  return (
    <div className="flex h-full flex-col">
      <p className="pixel-label mb-1 text-inksoft">Lv. 1 Prompt (before)</p>
      <div className="prompt-box flex-1">{battle.before.text}</div>
      {battle.before.note && <p className="mt-2 text-sm text-inksoft">{battle.before.note}</p>}
    </div>
  )
}

function AfterPanel({ battle, highlight }: { battle: Battle; highlight: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <p className="pixel-label mb-1 text-lanyard">Upgraded Prompt (after)</p>
      <div className="prompt-box flex-1">
        {battle.after.segments.map((s, i) =>
          s.tag && highlight ? (
            <mark
              key={i}
              className="px-0.5 text-ink"
              style={{ background: TAG_INFO[s.tag].color, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
              title={TAG_INFO[s.tag].label}
            >
              {s.text}
              <sup className="ml-0.5 font-pixel text-xs font-bold text-ink/70">{TAG_INFO[s.tag].label}</sup>
            </mark>
          ) : (
            <span key={i}>{s.text}</span>
          ),
        )}
      </div>
      {battle.after.note && <p className="mt-2 text-sm text-inksoft">{battle.after.note}</p>}
    </div>
  )
}

// The main feature: an RPG battle screen comparing the before and after prompts.
export default function PromptBattle({ battle }: { battle: Battle }) {
  const [view, setView] = useState<View>('vs')
  const [highlight, setHighlight] = useState(true)
  const [hit, setHit] = useState(false)
  const { unlockAchievement } = useGame()

  const techniques: Tag[] =
    battle.techniques ??
    Array.from(new Set(battle.after.segments.map((s) => s.tag).filter((t): t is Tag => !!t && t !== 'missing')))

  const afterText = battle.after.segments.map((s) => s.text).join('')
  const incomplete = battle.after.segments.some((s) => s.tag === 'missing') || battle.before.text.startsWith('[') || battle.before.text.startsWith('(')
  const beforeWords = words(battle.before.text)
  const afterWords = words(afterText)

  const choose = (v: View) => {
    playSfx(v === 'after' ? 'complete' : 'click')
    setView(v)
    if (v === 'after') {
      setHit(true)
      unlockAchievement('upgrade', 'Achievement Unlocked!', 'Power Up: viewed an Upgraded Prompt.')
    } else setHit(false)
  }

  const views: { id: View; label: string }[] = [
    { id: 'before', label: 'Lv. 1' },
    { id: 'vs', label: 'VS' },
    { id: 'after', label: 'Upgraded' },
  ]

  return (
    <div>
      {/* Arena */}
      <div className="frame-sm f-dark mb-4 p-3 text-cream">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-24 items-end">
              <Slime size={70} ko={hit} />
            </div>
            <p className="mt-1 font-pixel text-base font-bold">Vague Slime</p>
            <p className="text-xs text-cream/70">Lv. 1 Prompt</p>
          </div>
          <div className="pb-8">
            <motion.span
              key={hit ? 'ko' : 'vs'}
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="frame-sm f-gold block px-2 font-pixel text-2xl font-bold text-lanyard"
            >
              {hit ? 'K.O.!' : 'VS'}
            </motion.span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-24 items-end">
              <Avatar pose={hit ? 'victory' : 'adventure'} size={92} facing="left" shadow={false} />
            </div>
            <p className="mt-1 font-pixel text-base font-bold">Jakov</p>
            <p className="text-xs text-cream/70">Upgraded Prompt</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-6">
          <div className="space-y-1">
            <Bar label="Techniques" value={0} max={8} color="#8fd15a" />
            {!incomplete && <Bar label="Words" value={beforeWords} max={Math.max(afterWords, beforeWords, 1)} color="#a9c8ee" />}
          </div>
          <div className="space-y-1">
            <Bar label="Techniques" value={techniques.length} max={8} color="#f2b632" />
            {!incomplete && <Bar label="Words" value={afterWords} max={Math.max(afterWords, beforeWords, 1)} color="#a9c8ee" />}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-cream/70">Stats are counted from the prompts below.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Choose which prompt to show" className="flex gap-1">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={view === v.id}
              onClick={() => choose(v.id)}
              className={`frame-sm px-2 py-0.5 font-pixel text-lg font-bold ${
                view === v.id ? (v.id === 'after' ? 'f-red text-white' : 'f-plank text-cream') : 'f-paper hover:-translate-y-0.5'
              }`}
            >
              {v.id === 'after' ? '⚔ ' : ''}
              {v.label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} className="h-4 w-4 accent-lanyard" />
          Highlight what was added
        </label>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'vs' ? (
            <div className="grid items-stretch gap-4 md:grid-cols-2">
              <BeforePanel battle={battle} />
              <AfterPanel battle={battle} highlight={highlight} />
            </div>
          ) : view === 'before' ? (
            <BeforePanel battle={battle} />
          ) : (
            <AfterPanel battle={battle} highlight={highlight} />
          )}
        </motion.div>
      </AnimatePresence>

      {techniques.length > 0 && (
        <div className="mt-4">
          <p className="pixel-label mb-2 text-inksoft">Techniques added</p>
          <ul className="flex flex-wrap gap-2">
            {techniques.map((t) => (
              <li key={t}>
                <TagChip tag={t} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
