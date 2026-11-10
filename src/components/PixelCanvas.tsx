import { useEffect, useRef } from 'react'

/**
 * Fills its parent with a low-resolution canvas (1 art pixel = `scale` CSS pixels)
 * and calls `draw` whenever the size changes.
 */
export default function PixelCanvas({
  draw,
  scale,
  className = '',
  deps = [],
}: {
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  scale?: number
  className?: string
  deps?: unknown[]
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    let last = ''
    const render = () => {
      const rect = parent.getBoundingClientRect()
      const s = scale ?? (rect.width < 640 ? 3 : 4)
      const w = Math.max(1, Math.ceil(rect.width / s))
      const h = Math.max(1, Math.ceil(rect.height / s))
      const key = `${w}x${h}`
      if (key === last) return
      last = key
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, w, h)
      draw(ctx, w, h)
    }
    render()
    const ro = new ResizeObserver(render)
    ro.observe(parent)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`crisp absolute inset-0 h-full w-full ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
