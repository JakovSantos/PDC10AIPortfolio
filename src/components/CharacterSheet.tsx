import { motion } from 'framer-motion'
import { useState } from 'react'
import Avatar, { type Pose } from './Avatar'
import Scene from './Scene'
import { profile } from '../data/portfolio'
import { playSfx } from '../lib/sound'

export function Plaque({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="frame f-wood drop mb-6 inline-block px-4 py-0.5 font-pixel text-3xl font-bold text-gold small-outline sm:text-4xl">
      {children}
    </h2>
  )
}

function Panel({ title, icon, children, className = '' }: { title: string; icon: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`pixel-box p-3 sm:p-4 ${className}`} aria-label={title}>
      <h3 className="mb-3 flex items-center gap-2 font-pixel text-xl font-bold text-lanyard sm:text-2xl">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

const EMOTES: { pose: Pose; label: string }[] = [
  { pose: 'happy', label: 'Happy' },
  { pose: 'idle', label: 'Idle' },
  { pose: 'curious', label: 'Curious' },
  { pose: 'chin', label: 'Thinking' },
  { pose: 'adventure', label: 'Explorer' },
  { pose: 'victory', label: 'Victory' },
]

// Pixel medal: ribbon on top, round gold disc with a pixel star in the middle.
const MEDAL_STAR = ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '##...##']

function MedalFace({ shiny = false, back = false }: { shiny?: boolean; back?: boolean }) {
  const disc: JSX.Element[] = []
  const cx = 8
  const cy = 11
  for (let dy = -6; dy <= 6; dy++) {
    const half = Math.floor(Math.sqrt(36 - dy * dy) + 0.35)
    disc.push(<rect key={`o${dy}`} x={cx - half - 1} y={cy + dy} width={half * 2 + 3} height={1} fill="#3a2717" />)
  }
  for (let dy = -5; dy <= 5; dy++) {
    const half = Math.floor(Math.sqrt(25 - dy * dy) + 0.35)
    disc.push(
      <rect key={`f${dy}`} x={cx - half} y={cy + dy} width={half * 2 + 1} height={1} fill={dy > 2 ? (shiny ? '#f2b632' : '#c4861a') : shiny ? '#ffd968' : '#f2b632'} />,
    )
  }
  return (
    <svg
      viewBox="0 0 17 18"
      className={`crisp absolute inset-0 h-full w-full [backface-visibility:hidden] ${back ? '[transform:rotateY(180deg)]' : ''}`}
      aria-hidden="true"
    >
      <rect x="4" y="0" width="3" height="5" fill="#d6453d" />
      <rect x="10" y="0" width="3" height="5" fill="#3d6fb5" />
      <rect x="4" y="4" width="9" height="1" fill="#3a2717" />
      {disc}
      <rect x="4" y="7" width="2" height="1" fill={shiny ? '#fffbe6' : '#ffe7a1'} />
      {MEDAL_STAR.map((row, y) =>
        row.split('').map((ch, x) =>
          ch === '#' ? <rect key={`s${x}-${y}`} x={5 + x} y={8 + y} width={1.02} height={1.02} fill={shiny ? '#ffffff' : '#fff6c9'} /> : null,
        ),
      )}
    </svg>
  )
}

function Medal() {
  return (
    <span className="medal relative block h-14 w-14 shrink-0 [transform-style:preserve-3d] transition-transform duration-500 group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
      <MedalFace />
      <MedalFace shiny back />
    </span>
  )
}

function Badge({ cert, index }: { cert: (typeof profile.certifications)[number]; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group frame-sm f-paper flex flex-col px-3 py-2.5 transition-[filter,transform] duration-200 [perspective:400px] hover:-translate-y-1 hover:[filter:drop-shadow(0_0_10px_rgba(242,182,50,0.9))] focus-within:[filter:drop-shadow(0_0_10px_rgba(242,182,50,0.9))]"
    >
      <div className="flex items-start gap-3">
        <Medal />
        <div>
          <p className="text-sm font-semibold leading-snug">{cert.name}</p>
          <p className="mt-0.5 text-xs text-inksoft">
            {cert.issuer} · {cert.date}
          </p>
        </div>
      </div>
      <a
        href={cert.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto self-start pt-2 font-pixel text-base font-semibold text-lanyard underline-offset-4 hover:underline"
      >
        View Credential ↗<span className="sr-only"> for {cert.name} (opens in a new tab)</span>
      </a>
    </motion.li>
  )
}

export default function CharacterSheet() {
  const [pose, setPose] = useState<Pose>('happy')

  return (
    <section id="character" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8" aria-labelledby="character-title">
      <Plaque id="character-title">Character Sheet</Plaque>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Portrait */}
        <div className="pixel-box flex flex-col p-3">
          <Scene variant="day" seed={21} hills={0.45} grass={0.72} clouds={false} className="frame-sm f-dark h-64 sm:h-72">
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <Avatar pose={pose} size={200} label={`Jakov's avatar, ${pose} pose`} />
            </div>
          </Scene>
          <div className="mt-2 flex flex-wrap justify-center gap-1" role="group" aria-label="Change Jakov's emote">
            {EMOTES.map((e) => (
              <button
                key={e.pose}
                type="button"
                aria-pressed={pose === e.pose}
                onClick={() => {
                  playSfx('click')
                  setPose(e.pose)
                }}
                className={`frame-sm px-1.5 font-pixel text-sm font-semibold ${pose === e.pose ? 'f-red text-white' : 'f-paper'}`}
              >
                {e.label}
              </button>
            ))}
          </div>
          <p className="frame-sm f-gold mt-3 px-3 py-1 text-center font-pixel text-xl font-bold">{profile.name}</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="pixel-label text-inksoft">Class</dt>
              <dd>{profile.className}</dd>
            </div>
            <div>
              <dt className="pixel-label text-inksoft">Specialization</dt>
              <dd>{profile.specialization}</dd>
            </div>
          </dl>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="pixel-btn mt-4 w-full">
            LinkedIn ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Guild Roles" icon="⚔">
            <p className="-mt-2 mb-3 text-xs text-inksoft">Experience</p>
            <ul className="space-y-3">
              {profile.guildRoles.map((r) => (
                <li key={r.title} className="frame-sm f-paper px-3 py-2.5">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-inksoft">
                    {r.org} · {r.period} · {r.location}
                  </p>
                  <p className="reading mt-1">{r.description}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Origin Story" icon="📜">
            <p className="-mt-2 mb-3 text-xs text-inksoft">Education</p>
            <ul className="space-y-3">
              {profile.education.map((e) => (
                <li key={e.school} className="frame-sm f-paper px-3 py-2.5">
                  <p className="font-semibold">{e.school}</p>
                  <p className="text-sm text-inksoft">
                    {e.degree} · {e.period}
                  </p>
                  <p className="mt-1 text-sm">Skills: {e.skills.join(', ')}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Equipped Skills" icon="🎒" className="mt-6">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {profile.skills.map((s, i) => (
            <li key={s} className="frame-sm f-stone flex items-center gap-2 px-2.5 py-1.5 text-sm transition-transform hover:-translate-y-0.5">
              <svg viewBox="0 0 5 5" width="15" height="15" className="crisp shrink-0" aria-hidden="true">
                <rect x="1" y="0" width="3" height="5" fill={['#d6453d', '#3d6fb5', '#4f8f3a', '#f2b632', '#9b5de5'][i % 5]} />
                <rect x="0" y="1" width="5" height="3" fill={['#d6453d', '#3d6fb5', '#4f8f3a', '#f2b632', '#9b5de5'][i % 5]} />
                <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
              </svg>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Achievements Unlocked" icon="🏅" className="mt-6">
        <p className="-mt-2 mb-3 text-xs text-inksoft">Certifications · hover a medal to flip it</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.certifications.map((c, i) => (
            <Badge key={c.url} cert={c} index={i} />
          ))}
        </ul>
      </Panel>
    </section>
  )
}
