import type { QuestIcon } from '../data/portfolio'

export type IconName = QuestIcon | 'shield' | 'swords' | 'star' | 'map' | 'mirror' | 'scrollb' | 'heart' | 'gem'

// 8x8 pixel icons. '#' = main color, 'o' = accent, 'w' = highlight, '.' = empty
const ICONS: Record<IconName, string[]> = {
  compass: ['..####..', '.#wwww#.', '#ww.o.w#', '#w.oo.w#', '#w.##.w#', '#ww.#ww#', '.#wwww#.', '..####..'],
  scroll: ['.######.', '#oww.wo#', '.#wwww#.', '.#w##w#.', '.#wwww#.', '.#w###.#', '#owwwwo#', '.######.'],
  magnifier: ['.####...', '#wwoo#..', '#woooo#.', '#oooo#..', '.####...', '....##..', '.....##.', '......##'],
  blocks: ['###.ooo.', '#w#.owo.', '###.ooo.', '........', 'ooo.###.', 'owo.#w#.', 'ooo.###.', '........'],
  robot: ['...oo...', '.######.', '#ww##ww#', '#wo##ow#', '.######.', '..#ww#..', '.##..##.', '........'],
  lock: ['..####..', '.#....#.', '.#....#.', '########', '#ooooow#', '#oo#ooo#', '#ooooo.#', '########'],
  crown: ['o..o..o.', '#..#..#.', '##.#.##.', '#######.', '#o#w#o#.', '#######.', '........', '........'],
  shield: ['########', '#oooo#w#', '#oooo#w#', '#oooo#w#', '.#ooo#w.', '.#oo#w#.', '..#o#w..', '...##...'],
  swords: ['#......o', '.#....o.', '..#..o..', '...#o...', '...o#...', '..o..#..', 'oo....##', 'o......#'],
  star: ['...##...', '...oo...', '########', '.#oooo#.', '..#oo#..', '.#o##o#.', '.#....#.', '........'],
  map: ['.##.##..', '#oo#oo##', '#o.#.o##', '#oo#o.##', '#o.#oo##', '#oo#o.##', '.##.##..', '........'],
  mirror: ['..####..', '.#wwoo#.', '#wwoooo#', '#woooo.#', '#ooo..o#', '.#oooo#.', '..####..', '...##...'],
  scrollb: ['.######.', '#wwwwww#', '#w####w#', '#wwwwww#', '#w###ww#', '#wwwwww#', '#w##www#', '.######.'],
  heart: ['.##.##..', '#oo#oo#.', '#ooooo#.', '#ooooo#.', '.#ooo#..', '..#o#...', '...#....', '........'],
  gem: ['.######.', '#wwoooo#', '#woooo##', '.#ooo##.', '..#o##..', '...##...', '........', '........'],
}

export default function PixelIcon({
  name,
  size = 24,
  color = '#3a2717',
  accent = '#d6453d',
  light = '#fff6e0',
}: {
  name: IconName
  size?: number
  color?: string
  accent?: string
  light?: string
}) {
  const rows = ICONS[name]
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} className="crisp" aria-hidden="true">
      {rows.map((row, y) =>
        row.split('').map((ch, x) =>
          ch === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1.02}
              height={1.02}
              fill={ch === 'o' ? accent : ch === 'w' ? light : color}
            />
          ),
        ),
      )}
    </svg>
  )
}
