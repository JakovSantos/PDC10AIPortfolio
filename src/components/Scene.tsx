import { useMemo, type ReactNode } from 'react'
import PixelCanvas from './PixelCanvas'
import { PALETTES, cloudCanvas, drawCave, drawLand, drawMountains, drawSky, type Variant } from '../lib/pixelArt'

/** Drifting pixel clouds rendered from the same generator as the scenery. */
export function Clouds({ variant = 'day', count = 4, top = [6, 30] }: { variant?: Exclude<Variant, 'cave'>; count?: number; top?: [number, number] }) {
  const clouds = useMemo(() => {
    const pal = PALETTES[variant]
    return Array.from({ length: count }, (_, i) => {
      const c = cloudCanvas(100 + i * 17, pal)
      return {
        src: c.toDataURL(),
        w: c.width,
        top: top[0] + ((i * 37) % (top[1] - top[0])),
        dur: 70 + ((i * 29) % 50),
        delay: -((i * 41) % 90),
        scale: 3 + (i % 2),
      }
    })
  }, [variant, count, top])
  return (
    <>
      {clouds.map((c, i) => (
        <img
          key={i}
          src={c.src}
          alt=""
          aria-hidden="true"
          className="cloud crisp pointer-events-none absolute left-0"
          style={{
            top: `${c.top}%`,
            width: c.w * c.scale,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
            imageRendering: 'pixelated',
          }}
        />
      ))}
    </>
  )
}

/** Small flapping pixel birds. */
export function Birds({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 7 3"
          width={21}
          height={9}
          aria-hidden="true"
          className="cloud bird crisp pointer-events-none absolute left-0"
          style={{ top: `${12 + i * 7}%`, animationDuration: `${28 + i * 9}s`, animationDelay: `${-i * 7}s` }}
        >
          <g style={{ animation: `flap ${0.5 + i * 0.1}s steps(2) infinite` }}>
            <rect x="0" y="0" width="1" height="1" fill="#3a2717" />
            <rect x="1" y="1" width="2" height="1" fill="#3a2717" />
            <rect x="3" y="2" width="1" height="1" fill="#3a2717" />
            <rect x="4" y="1" width="2" height="1" fill="#3a2717" />
            <rect x="6" y="0" width="1" height="1" fill="#3a2717" />
          </g>
        </svg>
      ))}
    </>
  )
}

/** A complete pixel landscape (sky, mountains, hills, trees, meadow) or a cave. */
export default function Scene({
  variant = 'day',
  seed = 4,
  path = false,
  clouds = true,
  birds = false,
  className = '',
  children,
  hills,
  grass,
}: {
  variant?: Variant
  seed?: number
  path?: boolean
  clouds?: boolean
  birds?: boolean
  className?: string
  children?: ReactNode
  hills?: number
  grass?: number
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <PixelCanvas
        deps={[variant, seed, path, hills, grass]}
        draw={(ctx, w, h) => {
          if (variant === 'cave') {
            drawCave(ctx, w, h, seed)
            return
          }
          const pal = PALETTES[variant]
          drawSky(ctx, w, h, pal, seed)
          drawMountains(ctx, w, h, pal, seed + 1, (hills ?? 0.66) + 0.02)
          drawLand(ctx, w, h, pal, seed + 2, { path, hills, grass })
        }}
      />
      {clouds && variant !== 'cave' && <Clouds variant={variant} count={3} top={[4, 26]} />}
      {birds && variant === 'day' && <Birds />}
      {children}
    </div>
  )
}
