'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { SafeImage } from '@/components/ui/SafeImage'

interface TourGalleryProps {
  images: string[]
  title: string
}

interface TileProps {
  src: string
  idx: number
  title: string
  sizes: string
  className?: string
  overlay?: React.ReactNode
  onOpen: (idx: number) => void
}

function Tile({ src, idx, title, sizes, className, overlay, onOpen }: TileProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(idx)}
      className={cn('group relative cursor-pointer overflow-hidden bg-brand-sand', className)}
      aria-label={`${title} ${idx + 1}`}
    >
      <SafeImage
        src={src}
        alt={idx === 0 ? title : ''}
        fill
        priority={idx === 0}
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
      />
      {overlay ?? <span aria-hidden className="absolute inset-0 bg-brand-navy/0 transition-colors duration-300 group-hover:bg-brand-navy/15" />}
    </button>
  )
}

/** Adapts to however many real photos the tour has (no repeated filler tiles). */
export function TourGallery({ images, title }: TourGalleryProps) {
  const t = useTranslations('tours')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const count = images.length

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx)
    setLightboxOpen(true)
  }
  const prev = useCallback(() => setLightboxIdx((i) => (i - 1 + count) % count), [count])
  const next = useCallback(() => setLightboxIdx((i) => (i + 1) % count), [count])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, prev, next])

  if (count === 0) return null

  const side = images.slice(1, 5)
  const remaining = Math.max(0, count - 5)

  return (
    <>
      <div
        className={cn(
          'relative mb-10 grid h-[260px] gap-2 overflow-hidden rounded-[2rem] sm:h-[380px] md:h-[460px]',
          side.length === 0 && 'grid-cols-1',
          side.length === 1 && 'sm:grid-cols-[3fr_2fr]',
          side.length >= 2 && side.length <= 3 && 'sm:grid-cols-[3fr_2fr]',
          side.length === 4 && 'sm:grid-cols-[3fr_2fr]',
        )}
      >
        <Tile src={images[0]} idx={0} title={title} onOpen={openLightbox} sizes="(max-width: 640px) 100vw, 60vw" className="h-full" />

        {side.length > 0 && (
          <div
            className={cn(
              'hidden h-full gap-2 sm:grid',
              side.length === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-1',
              side.length === 2 && 'grid-rows-2',
              side.length === 3 && 'grid-rows-3',
            )}
          >
            {side.map((src, i) => {
              const idx = i + 1
              const isLast = i === side.length - 1
              return (
                <Tile
                  key={`${src}-${idx}`}
                  src={src}
                  idx={idx}
                  title={title}
                  onOpen={openLightbox}
                  sizes="25vw"
                  className="h-full"
                  overlay={
                    isLast && remaining > 0 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-brand-navy/60 font-display text-xl font-semibold text-white">
                        +{remaining} {t('photos')}
                      </span>
                    ) : undefined
                  }
                />
              )
            })}
          </div>
        )}

        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-navy backdrop-blur">
          <Expand className="h-3.5 w-3.5" />
          {count} {t('photos')}
        </span>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/95 backdrop-blur"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="absolute left-1/2 top-6 -translate-x-1/2 text-sm font-semibold tabular-nums text-white/70">
              {lightboxIdx + 1} / {count}
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative mx-4 aspect-[16/10] w-full max-w-5xl sm:mx-16"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage src={images[lightboxIdx]} alt={`${title} ${lightboxIdx + 1}`} fill sizes="90vw" className="object-contain" />
            </motion.div>

            {count > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  aria-label="Previous"
                  className="absolute left-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next() }}
                  aria-label="Next"
                  className="absolute right-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
