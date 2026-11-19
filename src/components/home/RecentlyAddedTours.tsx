'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { TourCard } from '@/components/tours/TourCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Tour } from '@/types'

interface RecentlyAddedToursProps {
  tours: Tour[]
}

export function RecentlyAddedTours({ tours }: RecentlyAddedToursProps) {
  const t = useTranslations('recentlyAddedTours')
  if (tours.length === 0) return null

  return (
    <section className="bg-brand-cream px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t('label')}
          title={t('title')}
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

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, i) => (
            <TourCard key={tour.id} tour={tour} index={i} className={i >= 3 ? 'hidden sm:block' : undefined} />
          ))}
        </div>
      </div>
    </section>
  )
}
