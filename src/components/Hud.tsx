import { AvatarPortrait } from './Avatar'
import { useGame } from '../lib/game'
import { playSfx } from '../lib/sound'
import { quests, titleScreen } from '../data/portfolio'

// Top bar: portrait, navigation, Prompting Level with an XP gauge, and the sound toggle (off by default).
export default function Hud() {
  const { go, level, visited, completed, sound, toggleSound, route } = useGame()
  const pct = Math.round((visited.length / quests.length) * 100)

  const nav = (r: Parameters<typeof go>[0]) => {
    playSfx('click')
    go(r)
  }

  const items = [
    { label: 'Character', r: { screen: 'journey', section: 'character' } as const, active: route.screen === 'journey' && route.section === 'character' },
    { label: 'Map', r: { screen: 'journey', section: 'map' } as const, active: route.screen === 'journey' && route.section !== 'character' },
    { label: 'Summary', r: { screen: 'summary' } as const, active: route.screen === 'summary' },
  ]

  return (
    <header className="sticky top-0 z-40 px-2 pt-2">
      <div className="frame-sm f-wood drop mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-2 py-1">
        <button
          type="button"
          onClick={() => nav({ screen: 'title' })}
          className="flex items-center gap-2"
          aria-label="LEVEL UP! A Prompting Adventure: back to title screen"
        >
          <span className="frame-sm f-blue">
            <AvatarPortrait size={30} />
          </span>
          <span className="hidden font-pixel text-xl font-bold text-gold small-outline sm:inline">{titleScreen.logoMain}</span>
        </button>

        <nav aria-label="Main" className="flex gap-1">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => nav(item.r)}
              aria-current={item.active ? 'page' : undefined}
              className={`frame-sm px-2 py-0 font-pixel text-base font-semibold sm:text-lg ${item.active ? 'f-red text-white' : 'f-paper hover:-translate-y-0.5'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2" title={`${visited.length} of ${quests.length} quests visited, ${completed.length} completed`}>
            <span className="frame-sm f-gold px-1.5 font-pixel text-base font-bold leading-tight">Lv.{level}</span>
            <div
              className="frame-sm f-dark hidden h-6 w-24 p-0 sm:block"
              role="progressbar"
              aria-label="Prompting level progress: quests visited"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className="h-full bg-gradient-to-r from-gold to-lanyard transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? 'Mute sound effects' : 'Turn on sound effects'}
            className="frame-sm f-paper px-1.5 font-pixel text-base font-semibold"
          >
            {sound ? '♪ On' : '♪ Off'}
          </button>
        </div>
      </div>
    </header>
  )
}
