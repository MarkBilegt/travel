'use client'

import { motion } from 'framer-motion'
import { tourPriceLabel } from '@/lib/tour-price-label'
import { ArrowRight, ArrowUpRight, Clock, MapPin } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'
import { getTourField } from '@/lib/tour-locale'
import { SafeImage } from '@/components/ui/SafeImage'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Tour } from '@/types'

/** Editorial bento: the first tour leads large, the rest fill the grid. */
// On phones every card is a fixed-height slide in a swipe carousel.
const LAYOUT = [
  'md:col-span-2 md:row-span-2 md:min-h-[620px]',
  'md:min-h-[300px]',
  'md:min-h-[300px]',
  'md:min-h-[340px]',
  'md:min-h-[340px]',
  'md:min-h-[340px]',
]

function FeatureCard({ tour, index }: { tour: Tour; index: number }) {
  const t = useTranslations('featuredTours')
  const toursT = useTranslations('tours')
  const locale = useLocale()
  const categories = t.raw('categories') as Record<string, string>
  const regionLabels = toursT.raw('regionLabels') as Record<string, string>
  const title = getTourField(tour, 'title', locale)
  const subtitle = getTourField(tour, 'shortDescription', locale)
  const lead = index === 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative h-[440px] w-[82%] flex-shrink-0 snap-start sm:w-[60%] md:h-auto md:w-auto',
        LAYOUT[index] ?? 'md:min-h-[340px]',
      )}
    >
      <Link
        href={`/tours/${tour.slug}`}
        className="absolute inset-0 block cursor-pointer overflow-hidden rounded-3xl bg-brand-navy"
        aria-label={title}
      >
        <SafeImage
          src={tour.coverImage}
          alt={title}
          fill
          sizes={lead ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
            {categories[tour.category] ?? tour.category}
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-navy transition-colors duration-300 group-hover:bg-brand-gold">
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          {tour.region && (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
              <MapPin className="h-3.5 w-3.5" />
              {regionLabels[tour.region] ?? tour.region}
            </p>
          )}
          <h3
            className={cn(
              'font-display font-bold uppercase leading-[0.95] text-white',
              lead ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-2xl sm:text-3xl',
            )}
          >
            {title}
          </h3>
          {lead && subtitle && <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">{subtitle}</p>}
          <div className="mt-5 flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-gold" />
              {t('days', { count: tour.duration })}
            </span>
            <span aria-hidden className="h-4 w-px bg-white/30" />
            <span className="font-display text-lg font-semibold tracking-wide text-white">{tourPriceLabel(tour, locale, toursT)}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

interface FeaturedToursProps {
  tours: Tour[]
}

export function FeaturedTours({ tours }: FeaturedToursProps) {
  const t = useTranslations('featuredTours')
  if (tours.length === 0) return null

  return (
    <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t('label')}
          title={t('title')}
          description={t('description')}
          action={
            <Link
              href="/tours"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-gold-deep"
            >
              {t('viewAll')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {tours.slice(0, 6).map((tour, i) => (
            <FeatureCard key={tour.id} tour={tour} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
