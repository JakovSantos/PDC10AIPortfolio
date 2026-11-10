import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { AvatarPortrait, type Pose } from './Avatar'

// Classic RPG dialog box: portrait, name tag, typewriter text, and a Skip button.
export default function DialogBox({
  speaker,
  text,
  speed = 22,
  className = '',
  portrait,
}: {
  speaker?: string
  text: string
  speed?: number
  className?: string
  portrait?: Pose
}) {
  const reduce = useReducedMotion()
  const [count, setCount] = useState(reduce ? text.length : 0)
  const done = count >= text.length

  useEffect(() => {
    setCount(reduce ? text.length : 0)
  }, [text, reduce])

  useEffect(() => {
    if (done) return
    const t = window.setTimeout(() => setCount((c) => c + 1), speed)
    return () => window.clearTimeout(t)
  }, [count, done, speed])

  return (
    <div className={`pixel-box relative flex gap-3 p-2 pt-3 sm:gap-4 ${className}`}>
      {speaker && (
        <span className="frame-sm f-red absolute -top-5 left-3 px-2 font-pixel text-base font-bold text-white sm:text-lg">
          {speaker}
        </span>
      )}
      {portrait && (
        <span className="frame-sm f-blue hidden shrink-0 self-start sm:block">
          <AvatarPortrait size={64} pose={portrait} />
        </span>
      )}
      <div className="flex-1">
        <p className="sr-only">{text}</p>
        <p className="reading min-h-[3em]" aria-hidden="true">
          {text.slice(0, count)}
          {!done && <span className="blink-text">▌</span>}
        </p>
        <div className="mt-1 flex justify-end">
          {!done ? (
            <button
              type="button"
              className="font-pixel text-base font-semibold text-inksoft underline-offset-4 hover:underline"
              onClick={() => setCount(text.length)}
            >
              Skip ▸
            </button>
          ) : (
            <span className="blink-text font-pixel text-base text-lanyard" aria-hidden="true">
              ▼
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
