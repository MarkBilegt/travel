'use client'

import { motion } from 'framer-motion'
import { tourPriceLabel } from '@/lib/tour-price-label'
import { Star, Clock, Users, MapPin } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { SafeImage } from '@/components/ui/SafeImage'
import { Link } from '@/navigation'
import { getTourArray, getTourField } from '@/lib/tour-locale'
import type { Tour } from '@/types'

interface FeaturedBannerProps {
  tour: Tour
}

export function FeaturedBanner({ tour }: FeaturedBannerProps) {
  const t = useTranslations('tours')
  const locale = useLocale()
  const title = getTourField(tour, 'title', locale)
  const description = getTourField(tour, 'shortDescription', locale)
  const includes = getTourArray(tour, 'includes', locale)
  const regionLabels = t.raw('regionLabels') as Record<string, string>
  const region = tour.region ? regionLabels[tour.region] ?? tour.region : ''

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' as const }}
      viewport={{ once: true, margin: '-80px' }}
      className="mx-4 lg:mx-8 rounded-3xl overflow-hidden my-16"
    >
      <div className="relative min-h-[400px] flex items-center">
        {/* Background image */}
        <SafeImage
          src={tour.coverImage}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-navy/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full px-4 sm:px-8 md:px-16 py-10 sm:py-12">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-brand-gold" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
                {t('featuredTour')} • {region}
              </span>
            </div>
            <h2 className="font-black text-white text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight leading-none mb-4">
              {title}
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-6 max-w-lg">
              {description}
            </p>
            <div className="flex items-center gap-6 text-white/60 text-sm mb-8">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold" />
                {t('days', { count: tour.duration })}
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-gold" />
                {tour.groupSize.min}–{tour.groupSize.max} {t('people')}
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                {t('featured')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link href={`/tours/${tour.slug}`}>
                <Button variant="gold" size="lg">
                  {t('book')}
                </Button>
              </Link>
              <div>
                <p className="text-white/40 text-xs mb-0.5">{t('perPerson')}</p>
                <p className="font-black text-white text-2xl">{tourPriceLabel(tour, locale, t)}</p>
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
              <h4 className="font-black text-sm uppercase tracking-wider mb-4 text-brand-gold">
                {t('includedTitle')}
              </h4>
              <ul className="space-y-3">
                {includes.slice(0, 5).map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
