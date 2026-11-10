import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect } from 'react'
import CharacterSheet from './components/CharacterSheet'
import FinalScreen from './components/FinalScreen'
import Hud from './components/Hud'
import Parallax from './components/Parallax'
import Popups from './components/Popups'
import QuestLog from './components/QuestLog'
import TitleScreen from './components/TitleScreen'
import WorldMap from './components/WorldMap'
import { quests } from './data/portfolio'
import { GameProvider, useGame, type Route } from './lib/game'

function Journey({ section }: { section?: string }) {
  useEffect(() => {
    const el = document.getElementById(section ?? 'character')
    if (el) {
      // wait a frame so layout is ready
      requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }))
    }
  }, [section])
  return (
    <main>
      <CharacterSheet />
      <WorldMap />
    </main>
  )
}

function keyFor(r: Route) {
  return r.screen === 'quest' ? `quest-${r.id}` : r.screen
}

function titleFor(r: Route) {
  const base = 'The Legend of Prompt: The Journey of Jakov'
  if (r.screen === 'quest') return `Quest ${r.id}: ${quests.find((q) => q.id === r.id)?.shortTitle} | ${base}`
  if (r.screen === 'summary') return `Level Up Summary | ${base}`
  if (r.screen === 'journey') return `Character and World Map | ${base}`
  return base
}

function Screens() {
  const { route } = useGame()

  useEffect(() => {
    document.title = titleFor(route)
  }, [route])

  return (
    <>
      <button
        type="button"
        onClick={() => document.getElementById('content')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-cream focus:p-2"
      >
        Skip to content
      </button>
      <Parallax />
      {route.screen !== 'title' && <Hud />}
      <div id="content" tabIndex={-1} className="outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={keyFor(route)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {route.screen === 'title' && <TitleScreen />}
            {route.screen === 'journey' && <Journey section={route.section} />}
            {route.screen === 'quest' && <QuestLog id={route.id} />}
            {route.screen === 'summary' && <FinalScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
      <Popups />
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <GameProvider>
        <Screens />
      </GameProvider>
    </MotionConfig>
  )
}
