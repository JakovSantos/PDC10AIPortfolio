import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { QuestReport, ReportBlock, ReportPart } from '../data/portfolio'
import { playSfx } from '../lib/sound'

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

/** Full-size view of a screenshot. Closes on click, the close button, or Escape. */
function Lightbox({ src, caption, onClose }: { src: string; caption: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={caption}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4"
      onClick={onClose}
    >
      <figure className="frame f-wood max-h-full max-w-5xl overflow-auto" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={caption} className="mx-auto block max-h-[75vh] w-auto" />
        <figcaption className="mt-2 flex items-start justify-between gap-3 text-sm">
          <span>{caption}</span>
          <button type="button" onClick={onClose} className="pixel-btn-light shrink-0 px-2 py-0.5 text-base" autoFocus>
            Close ×
          </button>
        </figcaption>
      </figure>
    </motion.div>
  )
}

function Block({ b, onImage }: { b: ReportBlock; onImage: (src: string, caption: string) => void }) {
  switch (b.kind) {
    case 'p':
      return <p className="reading">{b.text}</p>
    case 'h':
      return <h4 className="pt-1 font-pixel text-xl text-lanyard">{b.text}</h4>
    case 'note':
      return <p className="frame-sm f-blue px-3 py-2 text-sm">{b.text}</p>
    case 'qa':
      return (
        <div className="frame-sm f-paper px-3 py-2.5">
          <p className="mb-1 font-semibold">{b.q}</p>
          {b.a.map((t, i) => (
            <p key={i} className="reading">
              {t}
            </p>
          ))}
        </div>
      )
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul'
      return (
        <Tag className={`reading space-y-1 pl-6 ${b.ordered ? 'list-decimal' : 'list-[square]'}`}>
          {b.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </Tag>
      )
    }
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-2 border-ink text-left text-sm">
            <thead className="bg-ink text-cream">
              <tr>
                {b.columns.map((c) => (
                  <th key={c} scope="col" className="p-2 font-pixel text-base font-normal">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, i) => (
                <tr key={i} className="border-t-2 border-ink/30 odd:bg-parchment/60">
                  {row.map((cell, j) =>
                    j === 0 ? (
                      <th key={j} scope="row" className="p-2 align-top font-semibold">
                        {cell}
                      </th>
                    ) : (
                      <td key={j} className="break-words p-2 align-top">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'prompt':
      return (
        <div>
          {b.label && <p className="pixel-label mb-1 text-inksoft">{b.label}</p>}
          <div className="prompt-box">{b.text}</div>
        </div>
      )
    case 'img':
      return (
        <figure>
          <button
            type="button"
            onClick={() => onImage(asset(b.src), b.caption)}
            className="frame-sm f-dark group block w-full p-0 transition-transform hover:-translate-y-0.5"
            aria-label={`Enlarge screenshot: ${b.caption}`}
          >
            <img src={asset(b.src)} alt={b.caption} loading="lazy" className="mx-auto block max-h-[420px] w-auto" />
          </button>
          <figcaption className="mt-1 text-xs text-inksoft">
            📷 {b.caption} <span className="text-lanyard">(click to enlarge)</span>
          </figcaption>
        </figure>
      )
    case 'link':
      return (
        <a href={b.url} target="_blank" rel="noopener noreferrer" className="pixel-btn-gold inline-flex text-base">
          🔗 {b.label} ↗<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )
  }
}

function Part({ part, index, onImage }: { part: ReportPart; index: number; onImage: (s: string, c: string) => void }) {
  const [open, setOpen] = useState(index === 0)
  const id = `part-${part.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
  return (
    <div className="frame-sm f-paper p-0">
      <button
        type="button"
        onClick={() => {
          playSfx('click')
          setOpen((o) => !o)
        }}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="font-pixel text-lg sm:text-xl">{part.title}</span>
        <span className="font-pixel text-2xl text-lanyard" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t-2 border-dashed border-ink/20 px-3 pb-3 pt-3">
              {part.blocks.map((b, i) => (
                <Block key={i} b={b} onImage={onImage} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Everything from the submitted PDF for one quest: my report and the activity instructions. */
export default function FullReport({ data }: { data: QuestReport }) {
  const [tab, setTab] = useState<'report' | 'instructions'>('report')
  const [image, setImage] = useState<{ src: string; caption: string } | null>(null)
  const parts = tab === 'report' ? data.report : data.instructions ?? []
  const shots = data.report.reduce((n, p) => n + p.blocks.filter((b) => b.kind === 'img').length, 0)

  return (
    <div>
      <div role="tablist" aria-label="Full report sections" className="mb-3 flex flex-wrap gap-1.5">
        {(
          [
            ['report', `📜 My Report (as submitted)${shots ? ` · ${shots} screenshot${shots > 1 ? 's' : ''}` : ''}`],
            ...(data.instructions ? [['instructions', '📋 Activity Instructions']] : []),
          ] as [typeof tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              playSfx('click')
              setTab(id)
            }}
            className={`frame-sm px-3 py-1 font-pixel text-lg ${tab === id ? 'f-red text-white' : 'f-paper'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-2" role="tabpanel">
        {parts.map((p, i) => (
          <Part key={`${tab}-${p.title}`} part={p} index={i} onImage={(src, caption) => setImage({ src, caption })} />
        ))}
      </div>
      <AnimatePresence>{image && <Lightbox src={image.src} caption={image.caption} onClose={() => setImage(null)} />}</AnimatePresence>
    </div>
  )
}
