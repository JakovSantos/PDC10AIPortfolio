import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { playSfx, setSoundEnabled } from './sound'
import { quests } from '../data/portfolio'

/* ---------- safe localStorage helpers ---------- */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: progress just won't persist */
  }
}

/* ---------- hash routing ---------- */
export type Route =
  | { screen: 'title' }
  | { screen: 'journey'; section?: string }
  | { screen: 'quest'; id: number }
  | { screen: 'summary' }

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (h.startsWith('quest/')) {
    const id = Number(h.split('/')[1])
    if (quests.some((q) => q.id === id)) return { screen: 'quest', id }
  }
  if (h.startsWith('journey')) return { screen: 'journey', section: h.split('/')[1] }
  if (h === 'summary') return { screen: 'summary' }
  return { screen: 'title' }
}

export function routeToHash(r: Route) {
  switch (r.screen) {
    case 'title':
      return '#/'
    case 'journey':
      return r.section ? `#/journey/${r.section}` : '#/journey'
    case 'quest':
      return `#/quest/${r.id}`
    case 'summary':
      return '#/summary'
  }
}

/* ---------- popups ---------- */
export interface Popup {
  id: number
  kind: 'quest' | 'achievement' | 'level'
  title: string
  text: string
}

interface GameState {
  route: Route
  go: (r: Route) => void
  visited: number[]
  completed: number[]
  visit: (id: number) => void
  complete: (id: number) => void
  level: number
  sound: boolean
  toggleSound: () => void
  popups: Popup[]
  pushPopup: (p: Omit<Popup, 'id'>) => void
  dismissPopup: (id: number) => void
  achievements: string[]
  unlockAchievement: (key: string, title: string, text: string) => void
  resetProgress: () => void
}

const GameCtx = createContext<GameState | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(parseHash)
  const [visited, setVisited] = useState<number[]>(() => load('pq-visited', []))
  const [completed, setCompleted] = useState<number[]>(() => load('pq-completed', []))
  const [achievements, setAchievements] = useState<string[]>(() => load('pq-achievements', []))
  const [sound, setSound] = useState<boolean>(() => load('pq-sound', false))
  const [popups, setPopups] = useState<Popup[]>([])

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    setSoundEnabled(sound)
    save('pq-sound', sound)
  }, [sound])

  const go = useCallback((r: Route) => {
    const hash = routeToHash(r)
    if (window.location.hash !== hash) window.location.hash = hash
    else setRoute(r)
  }, [])

  const pushPopup = useCallback((p: Omit<Popup, 'id'>) => {
    const id = Date.now() + Math.random()
    setPopups((list) => [...list, { ...p, id }])
    window.setTimeout(() => setPopups((list) => list.filter((x) => x.id !== id)), 4200)
  }, [])

  const dismissPopup = useCallback((id: number) => setPopups((l) => l.filter((x) => x.id !== id)), [])

  const unlockAchievement = useCallback(
    (key: string, title: string, text: string) => {
      setAchievements((list) => {
        if (list.includes(key)) return list
        const next = [...list, key]
        save('pq-achievements', next)
        pushPopup({ kind: 'achievement', title, text })
        return next
      })
    },
    [pushPopup],
  )

  const visitedRef = useRef(visited)
  visitedRef.current = visited
  const visit = useCallback(
    (id: number) => {
      const list = visitedRef.current
      if (list.includes(id)) return
      const next = [...list, id]
      visitedRef.current = next
      save('pq-visited', next)
      setVisited(next)
      if (next.length > 1) {
        playSfx('complete')
        pushPopup({ kind: 'level', title: 'Level Up!', text: `Prompting Lv.${next.length - 1} → Lv.${next.length}` })
      }
    },
    [pushPopup],
  )

  const complete = useCallback(
    (id: number) => {
      setCompleted((list) => {
        if (list.includes(id)) return list
        const next = [...list, id]
        save('pq-completed', next)
        playSfx('complete')
        pushPopup({ kind: 'quest', title: 'Quest Complete!', text: `Quest ${id} cleared. +XP` })
        return next
      })
    },
    [pushPopup],
  )

  // Achievements based on progress
  useEffect(() => {
    if (completed.length >= 1)
      unlockAchievement('first', 'Achievement Unlocked!', 'First Steps: completed your first quest.')
    if (completed.length >= 4)
      unlockAchievement('half', 'Achievement Unlocked!', 'Halfway There: four quests completed.')
    if (completed.length >= quests.length)
      unlockAchievement('all', 'Achievement Unlocked!', 'Prompt Master: every quest completed!')
  }, [completed, unlockAchievement])

  const toggleSound = useCallback(() => {
    setSound((s) => {
      const next = !s
      setSoundEnabled(next)
      if (next) playSfx('click')
      return next
    })
  }, [])

  const resetProgress = useCallback(() => {
    setVisited([])
    setCompleted([])
    setAchievements([])
    save('pq-visited', [])
    save('pq-completed', [])
    save('pq-achievements', [])
  }, [])

  const level = Math.max(1, visited.length)

  const value = useMemo(
    () => ({
      route,
      go,
      visited,
      completed,
      visit,
      complete,
      level,
      sound,
      toggleSound,
      popups,
      pushPopup,
      dismissPopup,
      achievements,
      unlockAchievement,
      resetProgress,
    }),
    [route, go, visited, completed, visit, complete, level, sound, toggleSound, popups, pushPopup, dismissPopup, achievements, unlockAchievement, resetProgress],
  )

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>
}

export function useGame() {
  const ctx = useContext(GameCtx)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
