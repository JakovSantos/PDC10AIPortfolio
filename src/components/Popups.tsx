import { AnimatePresence, motion } from 'framer-motion'
import { AvatarPortrait } from './Avatar'
import { useGame } from '../lib/game'

// "Quest Complete!", "Achievement Unlocked!", and "Level Up!" toasts. They never block content.
export default function Popups() {
  const { popups, dismissPopup } = useGame()
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 flex w-[min(92vw,340px)] flex-col gap-3" aria-live="polite">
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className={`frame drop pointer-events-auto px-2 py-1 ${p.kind === 'quest' ? 'f-gold' : p.kind === 'level' ? 'f-blue' : 'f-wood'}`}
            role="status"
          >
            <div className="flex items-center gap-3">
              <span className="frame-sm f-paper shrink-0">
                <AvatarPortrait size={40} pose={p.kind === 'achievement' ? 'happy' : 'victory'} />
              </span>
              <div className="flex-1">
                <p className="font-pixel text-xl font-bold leading-tight text-lanyard">{p.title}</p>
                <p className="text-sm">{p.text}</p>
              </div>
              <button type="button" onClick={() => dismissPopup(p.id)} className="self-start font-pixel text-xl" aria-label="Dismiss notification">
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
