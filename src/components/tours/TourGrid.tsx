'use client'

import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TourCard } from './TourCard'
import type { Tour } from '@/types'

interface TourGridProps {
  tours: Tour[]
}

export function TourGrid({ tours }: TourGridProps) {
  const t = useTranslations('tours')

  if (tours.length === 0) {
    return (
      <div className="text-center py-24">
        <Search className="w-12 h-12 mx-auto mb-4 text-brand-blue" />
        <h3 className="font-black text-brand-navy text-xl uppercase mb-2">{t('emptyTitle')}</h3>
        <p className="text-gray-400 text-sm">{t('emptyDescription')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours.map((tour, i) => (
        <TourCard key={tour.id} tour={tour} index={i} />
      ))}
    </div>
  )
}
