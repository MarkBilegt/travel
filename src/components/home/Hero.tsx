'use client'

import { useState, useEffect, useRef } from 'react'
import { fromPrice } from '@/lib/tour-pricing'
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from 'framer-motion'
import { ArrowUpRight, Clock, MapPin, Pause, Play } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/navigation'
import { cn, formatPrice } from '@/lib/utils'
import { getTourField } from '@/lib/tour-locale'
import { SafeImage } from '@/components/ui/SafeImage'
import { buttonStyles } from '@/components/ui/Button'
import type { Tour } from '@/types'

const SLIDE_SECONDS = 7
const EASE = [0.16, 1, 0.3, 1] as const

interface HeroProps {
  tours?: Tour[]
}

/** "Lago Khuvsgul: le rive" splits into lead + rest */
function splitHeadline(title: string) {
  const i = title.indexOf(':')
  if (i === -1) return { lead: title, rest: '' }
  return { lead: title.slice(0, i).trim(), rest: title.slice(i + 1).trim() }
}

export function Hero({ tours }: HeroProps) {
  const t = useTranslations('hero')
  const toursT = useTranslations('tours')
  const locale = useLocale()
  const reduceMotion = useReducedMotion()
  const regionLabels = toursT.raw('regionLabels') as Record<string, string>

  const slides = (tours ?? []).slice(0, 5).map((tour) => {
    const title = getTourField(tour, 'title', locale)
    return {
      id: tour.id,
      image: tour.coverImage,
      title,
      ...splitHeadline(title),
      subtitle: getTourField(tour, 'shortDescription', locale),
      location: [tour.region ? regionLabels[tour.region] ?? tour.region : '', ...(tour.destinations ?? []).slice(0, 2)].filter(Boolean).join(' · '),
      slug: tour.slug,
      days: tour.duration,
      duration: t('duration', { days: tour.duration, nights: Math.max(0, tour.duration - 1) }),
      price: fromPrice(tour) === null ? toursT('priceOnRequest') : t('startingFrom', { price: formatPrice(fromPrice(tour) as number, tour.currency, locale) }),
    }
  })

  const count = slides.length
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const paused = hovered || userPaused
  const progress = useMotionValue(0)
  const controlsRef = useRef<AnimationPlaybackControls | null>(null)
  const pausedRef = useRef(paused)
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  // Autoplay driven by a motion value so the progress bar and the timer stay in sync.
  useEffect(() => {
    progress.set(0)
    if (count <= 1 || reduceMotion) return
    const controls = animate(progress, 1, {
      duration: SLIDE_SECONDS,
      ease: 'linear',
      onComplete: () => setCurrent((p) => (p + 1) % count),
    })
    controlsRef.current = controls
    if (pausedRef.current) controls.pause()
    return () => controls.stop()
  }, [current, count, reduceMotion, progress])

  useEffect(() => {
    if (paused) controlsRef.current?.pause()
    else controlsRef.current?.play()
  }, [paused])

  const go = (i: number) => setCurrent(((i % count) + count) % count)

  if (count === 0) {
    return (
      <section className="relative flex h-[100svh] min-h-[560px] items-center justify-center overflow-hidden bg-brand-navy">
        <div aria-hidden className="absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-brand-blue/40 blur-3xl" />
        <div aria-hidden className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-brand-gold/25 blur-3xl" />
        <div className="relative z-10 px-6 text-center">
          <p className="mb-6 text-lg text-white/60">{t('emptyMessage')}</p>
          <Link href="/tours" className={buttonStyles({ variant: 'gold', size: 'lg' })}>
            {t('emptyAction')}
          </Link>
        </div>
      </section>
    )
  }

  const slide = slides[current]

  return (
    <motion.section
      className="relative h-[100svh] min-h-[640px] touch-pan-y overflow-hidden bg-brand-navy"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onPanEnd={(_, info) => {
        if (Math.abs(info.offset.x) < 60 || Math.abs(info.offset.y) > Math.abs(info.offset.x)) return
        go(current + (info.offset.x < 0 ? 1 : -1))
      }}
      aria-roledescription="carousel"
    >
      {/* Background photo with a slow cinematic push-in */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: reduceMotion ? 1 : 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : SLIDE_SECONDS + 1.5, ease: 'easeOut' }}
          >
            <SafeImage
              src={slide.image}
              alt={slide.title}
              fill
              priority={current === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Legibility layers: lighter than before so the photo carries the page */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/25 to-brand-navy/10" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-navy/75 via-brand-navy/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-24 pt-28 sm:px-8 lg:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial="hidden"
                animate="show"
                exit="exit"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.08 } },
                  exit: { opacity: 0, transition: { duration: 0.25 } },
                }}
              >
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                  className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80"
                >
                  <span className="tabular-nums text-brand-gold">
                    {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                  </span>
                  <span aria-hidden className="h-px w-8 bg-white/40" />
                  {slide.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                      {slide.location}
                    </span>
                  )}
                </motion.div>

                <h1 className="mb-6 text-white">
                  <span className="block overflow-hidden pb-1">
                    <motion.span
                      variants={{ hidden: { y: '105%' }, show: { y: 0, transition: { duration: 0.9, ease: EASE } } }}
                      className="block text-[clamp(3.25rem,11vw,8.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.01em]"
                    >
                      {slide.lead}
                    </motion.span>
                  </span>
                  {slide.rest && (
                    <span className="block overflow-hidden pb-2">
                      <motion.span
                        variants={{ hidden: { y: '110%' }, show: { y: 0, transition: { duration: 0.9, ease: EASE } } }}
                        className="block font-accent text-[clamp(2rem,5.5vw,4.25rem)] font-medium italic leading-[1.05] text-white/95"
                      >
                        {slide.rest}
                      </motion.span>
                    </span>
                  )}
                </h1>

                <motion.p
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                  className="mb-7 max-w-lg text-base leading-relaxed text-white/80 md:text-lg"
                >
                  {slide.subtitle}
                </motion.p>

                <motion.div
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                  className="flex flex-col gap-5 sm:flex-row sm:items-center"
                >
                  <div className="flex gap-3">
                    <Link
                      href={`/tours/${slide.slug}`}
                      className={buttonStyles({ variant: 'gold', size: 'lg', className: 'flex-1 sm:flex-none' })}
                    >
                      {t('book')}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/tours"
                      className={buttonStyles({ variant: 'glass', size: 'lg', className: 'flex-1 sm:flex-none' })}
                    >
                      {t('allTours')}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-brand-gold" />
                      {slide.duration}
                    </span>
                    <span aria-hidden className="h-4 w-px bg-white/30" />
                    <span className="font-display text-lg font-semibold tracking-wide text-white">{slide.price}</span>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Tour rail (desktop) */}
          {count > 1 && (
            <div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{t('upNext')}</p>
                {!reduceMotion && (
                  <button
                    onClick={() => setUserPaused((v) => !v)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white hover:text-brand-navy"
                    aria-label={userPaused ? t('play') : t('pause')}
                  >
                    {userPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              <ul className="space-y-2">
                {slides.map((s, i) => {
                  const active = i === current
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => go(i)}
                        aria-current={active}
                        className={cn(
                          'group relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-2xl p-2 pr-4 text-left backdrop-blur-md transition-colors',
                          active ? 'bg-white/15 ring-1 ring-white/25' : 'bg-white/[0.06] hover:bg-white/10',
                        )}
                      >
                        <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                          <SafeImage src={s.image} alt="" fill sizes="56px" className="object-cover" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block truncate text-sm font-semibold', active ? 'text-white' : 'text-white/80')}>
                            {s.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-white/55">{s.duration}</span>
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-white/45">{String(i + 1).padStart(2, '0')}</span>
                        {active && (
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
                            <motion.span style={{ scaleX: progress }} className="block h-full origin-left bg-brand-gold" />
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile / tablet progress segments */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-8 z-20 mx-auto flex max-w-7xl gap-2 px-5 sm:px-8 lg:hidden">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`${i + 1}. ${s.title}`}
              className="relative h-6 flex-1 cursor-pointer"
            >
              <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                {i < current && <span className="block h-full bg-white" />}
                {i === current && <motion.span style={{ scaleX: progress }} className="block h-full origin-left bg-brand-gold" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </motion.section>
  )
}
