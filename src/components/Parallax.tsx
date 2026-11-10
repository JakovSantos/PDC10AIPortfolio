import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import PixelCanvas from './PixelCanvas'
import { Clouds } from './Scene'
import { PALETTES, drawLand, drawMountains, drawSky } from '../lib/pixelArt'

// Fixed pixel-art backdrop for the inner pages. Mountains and land move at different speeds on scroll.
export default function Parallax() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const far = useTransform(scrollY, [0, 3000], [0, reduce ? 0 : 40])
  const near = useTransform(scrollY, [0, 3000], [0, reduce ? 0 : 90])
  const pal = PALETTES.day

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0">
        <PixelCanvas draw={(ctx, w, h) => drawSky(ctx, w, h, pal, 3)} />
      </div>
      <Clouds variant="day" count={4} top={[5, 34]} />
      <motion.div className="absolute inset-x-0 -bottom-24 top-0" style={{ y: far }}>
        <PixelCanvas draw={(ctx, w, h) => drawMountains(ctx, w, h, pal, 5, 0.72)} />
      </motion.div>
      <motion.div className="absolute inset-x-0 -bottom-24 top-0" style={{ y: near }}>
        <PixelCanvas draw={(ctx, w, h) => drawLand(ctx, w, h, pal, 8, { hills: 0.7, grass: 0.86 })} />
      </motion.div>
    </div>
  )
}
