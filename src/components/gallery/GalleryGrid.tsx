'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface GalleryItem {
  id: string
  url: string
  alt: string
  caption: string
}

/** Photo grid; clicking a photo opens it large, with arrows and the keyboard to move between photos. */
export function GalleryGrid({ photos }: { photos: GalleryItem[] }) {
  const t = useTranslations('gallery')
  const [open, setOpen] = useState<number | null>(null)

  const move = useCallback(
    (step: number) => setOpen((cur) => (cur === null ? cur : (cur + step + photos.length) % photos.length)),
    [photos.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') move(1)
      if (e.key === 'ArrowLeft') move(-1)
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, move])

  const current = open === null ? null : photos[open]

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>button]:mb-3">
        {photos.map((p, i) => (
          <button key={p.id} type="button" onClick={() => setOpen(i)} className="group block w-full overflow-hidden rounded-2xl bg-brand-cream focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/40" aria-label={p.alt || p.caption || `${i + 1}`}>
            <Image src={p.url} alt={p.alt || p.caption || ''} width={600} height={450} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/95 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
            <button type="button" onClick={() => setOpen(null)} aria-label={t('close')} className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
            {photos.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); move(-1) }} aria-label={t('prev')} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); move(1) }} aria-label={t('next')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Image src={current.url} alt={current.alt || current.caption || ''} width={1800} height={1200} sizes="100vw" className="max-h-[85vh] w-auto rounded-xl object-contain" priority />
              {(current.caption || current.alt) && <figcaption className="mt-3 text-center text-sm text-white/80">{current.caption || current.alt}</figcaption>}
            </figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
