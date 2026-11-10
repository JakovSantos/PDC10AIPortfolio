import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Avatar from './Avatar'
import { dungeonLevels, frameworks, organizeDemo, skillRules, vaultLocks } from '../data/portfolio'
import { playSfx } from '../lib/sound'

const LETTER_COLORS = ['#ffd166', '#a0d8ff', '#b8f2c9', '#d9c8ff', '#ffcfa3', '#ffc4d6']

/* ---------------- Quest 4: framework selector ---------------- */
export function FrameworkSelector() {
  const [active, setActive] = useState(0)
  const fw = frameworks[active]
  return (
    <div>
      <div role="tablist" aria-label="Prompt frameworks" className="mb-4 flex flex-wrap gap-1.5">
        {frameworks.map((f, i) => (
          <button
            key={f.name}
            role="tab"
            id={`fw-tab-${i}`}
            aria-selected={active === i}
            aria-controls="fw-panel"
            onClick={() => {
              playSfx('click')
              setActive(i)
            }}
            className={`frame-sm px-2 py-0.5 font-pixel text-lg font-bold transition-transform hover:-translate-y-0.5 ${
              active === i ? 'f-red text-white' : 'f-paper'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>
      <div id="fw-panel" role="tabpanel" aria-labelledby={`fw-tab-${active}`}>
        <motion.ul key={fw.name} className="mb-3 flex flex-wrap gap-2" aria-label="Framework letters">
          {fw.parts.map((p, i) => (
            <motion.li
              key={i}
              initial={{ y: -16, opacity: 0, rotate: -8 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 15 }}
              className="flex items-center gap-1.5"
            >
              <span
                className="flex h-9 w-9 items-center justify-center border-[3px] border-ink font-pixel text-2xl font-bold shadow-[3px_3px_0_0_#3a2717]"
                style={{ background: LETTER_COLORS[i % LETTER_COLORS.length] }}
              >
                {p.letter}
              </span>
              <span className="text-sm font-semibold">{p.name}</span>
            </motion.li>
          ))}
        </motion.ul>
        <AnimatePresence mode="wait">
          <motion.div key={fw.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="prompt-box">
            {fw.parts.map((p, i) => (
              <span key={i}>
                <mark
                  className="px-0.5 text-ink"
                  style={{ background: LETTER_COLORS[i % LETTER_COLORS.length], boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
                >
                  <sup className="mr-1 font-pixel text-xs font-bold">{p.letter}</sup>
                  {p.text}
                </mark>{' '}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------- Quest 5: dungeon progress ---------------- */
function Door({ open, boss }: { open: boolean; boss?: boolean }) {
  return (
    <svg viewBox="0 0 12 14" width={boss ? 56 : 44} height={boss ? 65 : 51} className="crisp" aria-hidden="true">
      <rect x="2" y="0" width="8" height="1" fill="#17151f" />
      <rect x="1" y="1" width="10" height="1" fill="#17151f" />
      <rect x="0" y="2" width="12" height="12" fill="#17151f" />
      <rect x="1" y="2" width="10" height="12" fill={boss ? '#7a3b8a' : '#6c6680'} />
      <rect x="2" y="1" width="8" height="1" fill={boss ? '#7a3b8a' : '#6c6680'} />
      <rect x="2" y="3" width="8" height="11" fill={open ? '#0d0b12' : '#7a4a22'} />
      {!open && (
        <>
          <rect x="2" y="3" width="8" height="1" fill="#b8763a" />
          <rect x="5" y="3" width="1" height="11" fill="#5e3a1e" />
          <rect x="7" y="8" width="1" height="1" fill="#f2b632" />
        </>
      )}
      {open && <rect x="4" y="9" width="4" height="1" fill={boss ? '#d6453d' : '#7cc04b'} />}
      {boss && (
        <>
          <rect x="4" y="5" width="1" height="1" fill={open ? '#d6453d' : '#f2b632'} />
          <rect x="7" y="5" width="1" height="1" fill={open ? '#d6453d' : '#f2b632'} />
        </>
      )}
    </svg>
  )
}

export function DungeonProgress() {
  const [open, setOpen] = useState(0)
  const lvl = dungeonLevels[open]
  const last = dungeonLevels.length - 1
  return (
    <div>
      <div className="frame-sm f-dark mb-4 overflow-x-auto">
        <ol className="flex min-w-max items-end gap-1 px-1 pt-2" aria-label="Dungeon levels, all cleared">
          {dungeonLevels.map((l, i) => (
            <li key={l.level} className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  playSfx('step')
                  setOpen(i)
                }}
                aria-pressed={open === i}
                aria-label={`${l.level}: ${l.name}, cleared`}
                className="group relative flex flex-col items-center px-1 transition-transform hover:-translate-y-1"
              >
                {open === i && (
                  <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2">
                    <Avatar pose="adventure" size={44} shadow={false} bob={false} />
                  </span>
                )}
                <span className={open === i ? 'opacity-40' : ''}>
                  <Door open boss={i === last} />
                </span>
                <span className={`mt-1 font-pixel text-sm font-bold ${open === i ? 'text-gold' : 'text-cream'}`}>
                  {i === last ? 'BOSS' : `L${i + 1}`} ✓
                </span>
              </button>
              {i < last && <span className="mb-7 h-1 w-4 bg-[#6c6680] sm:w-7" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={open} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="frame-sm f-paper">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-pixel text-xl font-bold text-lanyard">
              {lvl.level}: {lvl.name}
            </p>
            <span className="frame-sm f-green px-1.5 font-pixel text-sm font-bold">CLEARED</span>
          </div>
          <p className="mt-2 text-sm text-inksoft">Scenario: {lvl.scenario}</p>
          <p className="pixel-label mb-1 mt-3 text-inksoft">Our repair prompt</p>
          <div className="prompt-box">{lvl.repair}</div>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <svg viewBox="0 0 5 5" width={16} height={16} className="crisp" aria-hidden="true">
              <rect x="1" y="0" width="3" height="5" fill="#c4861a" />
              <rect x="0" y="1" width="5" height="3" fill="#c4861a" />
              <rect x="1" y="1" width="3" height="3" fill="#f2b632" />
              <rect x="1" y="1" width="1" height="1" fill="#fff6c9" />
            </svg>
            Wallet after this level: <b>{lvl.wallet}</b>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------------- Quest 6: six padlocks ---------------- */
function Padlock({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 10 12" width="40" height="48" className="crisp" aria-hidden="true">
      <motion.g animate={{ y: open ? -2 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
        <rect x="2" y="0" width="6" height="1" fill="#3a2717" />
        <rect x="1" y="1" width="1" height="4" fill="#3a2717" />
        <rect x="8" y="1" width="1" height={open ? 2 : 4} fill="#3a2717" />
        <rect x="2" y="1" width="1" height="1" fill="#c9c4d6" />
      </motion.g>
      <rect x="0" y="5" width="10" height="7" fill="#3a2717" />
      <rect x="1" y="6" width="8" height="5" fill={open ? '#f2b632' : '#9a94ab'} />
      <rect x="1" y="6" width="8" height="1" fill={open ? '#ffe7a1' : '#c9c4d6'} />
      <rect x="4" y="7" width="2" height="2" fill="#3a2717" />
      <rect x="4.5" y="9" width="1" height="1" fill="#3a2717" />
    </svg>
  )
}

export function LockRow() {
  const [opened, setOpened] = useState<number[]>([])
  const [active, setActive] = useState<number | null>(null)
  const toggle = (i: number) => {
    playSfx(opened.includes(i) ? 'click' : 'open')
    setOpened((o) => (o.includes(i) ? o : [...o, i]))
    setActive(i)
  }
  const openAll = () => {
    playSfx('complete')
    setOpened(vaultLocks.map((_, i) => i))
    setActive(0)
  }
  return (
    <div>
      <div className="frame-sm f-stone mb-4">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {vaultLocks.map((l, i) => (
            <li key={l.name}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={active === i}
                aria-label={`Lock ${i + 1}: ${l.name}${opened.includes(i) ? ', opened' : ''}`}
                className={`frame-sm flex w-full flex-col items-center gap-1 px-1 py-1 transition-transform hover:-translate-y-1 ${
                  active === i ? 'f-gold' : 'f-paper'
                }`}
              >
                <Padlock open={opened.includes(i)} />
                <span className="font-pixel text-sm font-bold">Lock {i + 1}</span>
                <span className="text-center text-xs leading-tight">{l.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={openAll} className="pixel-btn-gold mb-4">
        🔑 Open all locks
      </button>
      <AnimatePresence mode="wait">
        {active !== null && (
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="frame-sm f-paper">
            <p className="font-pixel text-xl font-bold text-lanyard">
              Lock {active + 1}: {vaultLocks[active].name}
            </p>
            <p className="reading mt-2">
              <b>Required:</b> {vaultLocks[active].required}
            </p>
            <p className="reading mt-2">
              <b>What happened:</b> {vaultLocks[active].outcome}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {active === null && <p className="text-sm text-inksoft">Click a padlock to open it and read what the lock required.</p>}
    </div>
  )
}

/* ---------------- Quest 7: ORGANIZE INBOX demo + Rulebook ---------------- */
function Folder({ color = '#f2b632' }: { color?: string }) {
  return (
    <svg viewBox="0 0 8 7" width={18} height={16} className="crisp shrink-0" aria-hidden="true">
      <rect x="0" y="0" width="3" height="1" fill="#3a2717" />
      <rect x="0" y="1" width="8" height="6" fill="#3a2717" />
      <rect x="1" y="2" width="6" height="4" fill={color} />
    </svg>
  )
}

export function OrganizeDemo() {
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')
  const s = organizeDemo.steps[step]
  const waiting = step === 2
  const approved = typed.trim() === 'APPROVE ORGANIZATION'
  const last = organizeDemo.steps.length - 1

  const next = () => {
    playSfx(step + 1 === last ? 'complete' : 'step')
    setStep((x) => Math.min(x + 1, last))
  }
  const reset = () => {
    setStep(0)
    setTyped('')
  }

  return (
    <div className="frame-sm f-paper">
      <ol className="mb-4 flex flex-wrap items-center gap-1" aria-label="Agent cycle">
        {organizeDemo.steps.map((st, i) => (
          <li key={st.name} className="flex items-center gap-1" aria-current={i === step ? 'step' : undefined}>
            <span
              className={`frame-sm px-1.5 font-pixel text-sm font-bold ${
                i < step ? 'f-green' : i === step ? 'f-red text-white' : 'f-stone text-inksoft'
              }`}
            >
              {i < step ? '✓ ' : ''}
              {i + 1}. {st.name}
            </span>
            {i < last && <span aria-hidden="true">▸</span>}
          </li>
        ))}
      </ol>

      <div className="prompt-box mb-3">
        <span className="text-[#9be59b]">you&gt;</span> ORGANIZE INBOX
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-live="polite">
          <div className="mb-3 flex items-start gap-3">
            <span className="hidden shrink-0 sm:block">
              <Avatar pose={step === last ? 'victory' : step === 2 ? 'chin' : step === 0 ? 'curious' : 'idle'} size={84} bob={false} />
            </span>
            <p className="reading frame-sm f-blue flex-1">
              <b className="font-pixel text-base text-ink">AGENT:</b> {s.text}
            </p>
          </div>

          {step === 0 && (
            <ul className="mb-3 space-y-1 font-mono text-xs sm:text-sm">
              {organizeDemo.inboxFiles.map((f) => (
                <li key={f} className="flex items-center gap-2 break-all">
                  <Folder color="#c9c4d6" /> 00 Inbox/{f}
                </li>
              ))}
            </ul>
          )}

          {step >= 1 && step <= 3 && (
            <div className="mb-3 overflow-x-auto">
              <table className="w-full min-w-[560px] border-2 border-ink text-left text-xs sm:text-sm">
                <thead className="bg-ink text-cream">
                  <tr>
                    <th className="p-2 font-pixel text-base">Current file</th>
                    <th className="p-2 font-pixel text-base">Proposed filename</th>
                    <th className="p-2 font-pixel text-base">Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {organizeDemo.plan.map((r, i) => (
                    <motion.tr
                      key={r.from}
                      initial={step === 3 ? { backgroundColor: '#fff9ea' } : false}
                      animate={step === 3 ? { backgroundColor: '#d7edb4' } : {}}
                      transition={{ delay: i * 0.25 }}
                      className="border-t-2 border-ink"
                    >
                      <td className="break-all p-2 font-mono">{r.from}</td>
                      <td className="p-2 font-mono">{r.to}</td>
                      <td className="p-2">
                        <span className="flex items-center gap-1">
                          <Folder /> {r.folder}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {waiting ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (approved) next()
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <label htmlFor="approve" className="text-sm">
            Type the approval phrase:
          </label>
          <input
            id="approve"
            value={typed}
            onChange={(e) => setTyped(e.target.value.toUpperCase())}
            placeholder="APPROVE ORGANIZATION"
            className="min-w-0 flex-1 border-[3px] border-ink bg-cream px-2 py-1.5 font-mono text-sm"
            autoComplete="off"
          />
          <button type="submit" className="pixel-btn" disabled={!approved}>
            Approve
          </button>
          {!approved && typed.length > 0 && <p className="w-full text-xs text-lanyard">The agent only accepts the exact phrase APPROVE ORGANIZATION.</p>}
        </form>
      ) : step < last ? (
        <button type="button" onClick={next} className="pixel-btn">
          Next step ▸
        </button>
      ) : (
        <button type="button" onClick={reset} className="pixel-btn-light">
          ↺ Replay demo
        </button>
      )}
    </div>
  )
}

export function Rulebook() {
  const [open, setOpen] = useState(false)
  return (
    <div className="frame-sm f-wood drop">
      <button
        type="button"
        onClick={() => {
          playSfx(open ? 'click' : 'open')
          setOpen((o) => !o)
        }}
        aria-expanded={open}
        aria-controls="rulebook"
        className="flex w-full items-center justify-between gap-3 p-2 text-left"
      >
        <span className="flex items-center gap-3">
          <svg viewBox="0 0 10 8" width={36} height={29} className="crisp" aria-hidden="true">
            <rect x="0" y="0" width="10" height="8" fill="#3a2717" />
            <rect x="1" y="1" width="8" height="6" fill={open ? '#fff6e0' : '#d6453d'} />
            <rect x="5" y="1" width="1" height="6" fill="#3a2717" />
            {open && (
              <>
                <rect x="2" y="2" width="2" height="1" fill="#6b4f3a" />
                <rect x="2" y="4" width="2" height="1" fill="#6b4f3a" />
                <rect x="6" y="2" width="2" height="1" fill="#6b4f3a" />
                <rect x="6" y="4" width="2" height="1" fill="#6b4f3a" />
              </>
            )}
            {!open && <rect x="2" y="3" width="2" height="2" fill="#f2b632" />}
          </svg>
          <span className="font-pixel text-xl font-bold">The Rulebook: 10 Permanent Safety Rules</span>
        </span>
        <span className="font-pixel text-2xl" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            id="rulebook"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden px-2 pb-2"
          >
            {skillRules.map((r, i) => (
              <li key={i} className="reading flex gap-3 border-t-2 border-dashed border-ink/20 pt-2">
                <span className="w-6 shrink-0 font-pixel text-lg font-bold text-lanyard">{i + 1}.</span>
                <span>
                  {r}
                  {(i === 5 || i === 8) && (
                    <span className="ml-2 inline-block border-2 border-ink bg-butter px-1 font-pixel text-xs font-bold">REVISED</span>
                  )}
                </span>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  )
}
