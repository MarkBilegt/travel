'use client'

import { motion } from 'framer-motion'
import { tourPriceLabel } from '@/lib/tour-price-label'
import { ArrowUpRight, Clock, MapPin, Users } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'
import { getTourField, isTourTranslated } from '@/lib/tour-locale'
import { SafeImage } from '@/components/ui/SafeImage'
import type { Tour } from '@/types'

export interface TourCardProps {
  tour: Tour
  index?: number
  className?: string
}

export function TourCard({ tour, index = 0, className }: TourCardProps) {
  const t = useTranslations('tours')
  const locale = useLocale()
  const title = getTourField(tour, 'title', locale)
  const categoryLabel = t(`categories.${tour.category}` as Parameters<typeof t>[0]) ?? tour.category
  const regionLabels = t.raw('regionLabels') as Record<string, string>
  const regionLabel = tour.region ? regionLabels[tour.region] ?? tour.region : ''

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn('group', className)}
    >
      {/* The whole card is one link: one clear action instead of two competing buttons */}
      <Link
        href={`/tours/${tour.slug}`}
        className="block cursor-pointer rounded-3xl focus-visible:outline-offset-4"
        aria-label={title}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-brand-sand">
          <SafeImage
            src={tour.coverImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {tour.isNew && (
              <span className="rounded-full bg-brand-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-navy">
                {t('new')}
              </span>
            )}
            {locale === 'en' && !isTourTranslated(tour, locale) && (
              <span className="rounded-full bg-brand-navy/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">MN</span>
            )}
          </div>

          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-navy backdrop-blur">
            <Clock className="h-3.5 w-3.5 text-brand-gold-deep" />
            {t('days', { count: tour.duration })}
          </span>
        </div>

        <div className="px-1 pt-5">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-navy/55">
            {regionLabel && (
              <span className="flex items-center gap-1 text-brand-gold-deep">
                <MapPin className="h-3.5 w-3.5" />
                {regionLabel}
              </span>
            )}
            {regionLabel && <span aria-hidden>·</span>}
            <span>{categoryLabel}</span>
          </p>

          <h3 className="font-display text-2xl font-semibold uppercase leading-tight text-brand-navy transition-colors group-hover:text-brand-gold-deep">
            {title}
          </h3>

          <div className="mt-4 flex items-end justify-between border-t border-brand-line pt-4">
            <div>
              <p className="text-xs text-brand-navy/55">{t('perPerson')}</p>
              <p className="font-display text-xl font-semibold tracking-wide text-brand-navy">{tourPriceLabel(tour, locale, t)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1 text-xs text-brand-navy/55 sm:flex">
                <Users className="h-3.5 w-3.5" />
                {tour.groupSize.min}–{tour.groupSize.max}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy transition-colors duration-300 group-hover:border-brand-gold group-hover:bg-brand-gold">
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
