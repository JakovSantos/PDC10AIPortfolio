import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

/*
  Jakov's avatar, built from the sprite sheet in /public/sprites.
  Every frame shares one 228x332 canvas with the feet aligned, so poses can swap in place.
*/
const SPRITE_W = 228
const SPRITE_H = 332

export type Pose =
  | 'idle'
  | 'happy'
  | 'curious'
  | 'thinking'
  | 'chin'
  | 'adventure'
  | 'walk'
  | 'cheer'
  | 'victory'
  | 'back'

export type Facing = 'left' | 'right' | 'up' | 'down'

const STILL: Record<Exclude<Pose, 'walk'>, string> = {
  idle: 'idle',
  happy: 'happy',
  curious: 'curious',
  thinking: 'thinking',
  chin: 'chin',
  adventure: 'adventure',
  cheer: 'victory', // both celebration poses use the arms-up victory sprite
  victory: 'victory',
  back: 'back',
}

const WALK: Record<Facing, string[]> = {
  right: ['walk1', 'walk2'],
  left: ['walk1', 'walk2'],
  up: ['back1', 'back2'],
  down: ['walk2', 'idle'],
}

const ALL = ['idle', 'happy', 'curious', 'thinking', 'chin', 'adventure', 'walk1', 'walk2', 'victory', 'back', 'back1', 'back2']

const src = (name: string) => `${import.meta.env.BASE_URL}sprites/${name}.png`

export function preloadSprites() {
  for (const n of ALL) {
    const img = new Image()
    img.src = src(n)
  }
}

interface AvatarProps {
  pose?: Pose
  /** Height in CSS pixels */
  size?: number
  facing?: Facing
  className?: string
  label?: string
  shadow?: boolean
  bob?: boolean
}

export default function Avatar({
  pose = 'idle',
  size = 160,
  facing = 'right',
  className = '',
  label,
  shadow = true,
  bob = true,
}: AvatarProps) {
  const reduce = useReducedMotion()
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (pose !== 'walk' || reduce) return
    const t = window.setInterval(() => setFrame((f) => (f + 1) % 2), 190)
    return () => window.clearInterval(t)
  }, [pose, reduce])

  const name = pose === 'walk' ? WALK[facing][reduce ? 0 : frame] : STILL[pose]
  const flip = facing === 'left'
  const width = (size * SPRITE_W) / SPRITE_H

  const anim = reduce || !bob
    ? {}
    : pose === 'cheer' || pose === 'victory'
      ? { y: [0, -size * 0.12, 0, -size * 0.06, 0], transition: { duration: 0.9 } }
      : pose === 'walk'
        ? { y: [0, -size * 0.02, 0], transition: { duration: 0.38, repeat: Infinity } }
        : { scaleY: [1, 1.015, 1], y: [0, -1, 0], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const } }

  return (
    <div className={`relative inline-block ${className}`} style={{ width, height: size }}>
      {shadow && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-ink/25"
          style={{ bottom: -size * 0.015, width: width * 0.62, height: size * 0.05 }}
        />
      )}
      <motion.img
        src={src(name)}
        alt={label ?? ''}
        aria-hidden={label ? undefined : true}
        width={width}
        height={size}
        draggable={false}
        className="relative block select-none"
        style={{ originY: 1, scaleX: flip ? -1 : 1 }}
        animate={anim}
      />
    </div>
  )
}

/*
  Profile photo: always the idle sprite. Its head was measured in the 228x332 canvas
  (hair centre x = 114, hair top y = 12); the portrait shows a 150x150 square starting
  8px above the hair, so the full face (hair to chin) fits.
*/
const PORTRAIT = { name: 'idle', cx: 114, top: 12 }
const CROP = 150

/** Head-and-shoulders profile photo from the idle sprite. `pose` is accepted for compatibility but ignored. */
export function AvatarPortrait({ size = 40 }: { size?: number; pose?: Pose }) {
  const { name, ...head } = PORTRAIT
  const k = size / CROP
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 overflow-hidden align-middle"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${src(name)})`,
        backgroundSize: `${SPRITE_W * k}px ${SPRITE_H * k}px`,
        backgroundPosition: `${-(head.cx - CROP / 2) * k}px ${-(head.top - 8) * k}px`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
