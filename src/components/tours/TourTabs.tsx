'use client'

import { useState } from 'react'
import { ConsentMap } from '@/components/ui/ConsentMap'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle2, MapPin, Wifi, Coffee, Waves } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { getTourField, getTourArray, getTourItinerary } from '@/lib/tour-locale'
import { Itinerary } from './Itinerary'
import { Inclusions } from './Inclusions'
import type { Tour } from '@/types'


interface TourTabsProps {
  tour: Tour
}

function OverviewPanel({ tour }: { tour: Tour }) {
  const t = useTranslations('tours')
  const locale = useLocale()
  const description = getTourField(tour, 'description', locale)
  const highlights = getTourArray(tour, 'includes', locale)
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-black text-brand-navy text-lg uppercase tracking-tight mb-3">{t('overviewTitle')}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
      <div>
        <h3 className="font-black text-brand-navy text-lg uppercase tracking-tight mb-4">{t('highlightsTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {highlights.slice(0, 6).map((item) => (
            <div key={item} className="flex items-center gap-3 bg-brand-cream rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-brand-navy">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HotelsPanel({ tour }: { tour: Tour }) {
  const t = useTranslations('tours')
  const hotels = tour.itinerary
    .filter((d) => d.accommodation)
    .reduce<{ name: string; nights: number }[]>((acc, d) => {
      const existing = acc.find((h) => h.name === d.accommodation)
      if (existing) existing.nights++
      else if (d.accommodation) acc.push({ name: d.accommodation, nights: 1 })
      return acc
    }, [])
    .slice(0, 2)

  if (hotels.length === 0)
    return <p className="text-gray-400 text-sm">{t('noHotelInfo')}</p>

  return (
    <div className="space-y-4">
      {hotels.map((hotel) => (
        <div key={hotel.name} className="flex gap-4 border border-gray-100 rounded-2xl overflow-hidden">
          <div className="relative w-36 flex-shrink-0">
            <Image src={tour.coverImage} alt={hotel.name} fill className="object-cover" sizes="144px" />
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-black text-brand-navy text-base">{hotel.name}</h4>
              <div className="flex">
                {Array.from({ length: 4 }, (_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                ))}
              </div>
            </div>
            <p className="flex items-center gap-1 text-xs text-gray-400 mb-3">
              <MapPin className="w-3 h-3" />
              {tour.destinations[0]}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {[Wifi, Coffee, Waves].map((Icon, i) => (
                <span key={i} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              <span className="font-bold text-brand-navy">{hotel.nights}</span> {t('nights')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function MapPanel({ tour }: { tour: Tour }) {
  const query = encodeURIComponent(`${tour.destinations[0] ?? tour.title}, Mongolia`)
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100">
      <ConsentMap title={`${tour.title} map`} src={`https://maps.google.com/maps?q=${query}&z=8&output=embed`} height={400} />
    </div>
  )
}

function ReviewsPanel() {
  const t = useTranslations('tours')

  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">⭐</div>
      <p className="text-brand-navy font-semibold text-lg mb-2">
        {t('reviewsComing')}
      </p>
      <p className="text-gray-400 text-sm">
        {t('reviewsPrompt')}
      </p>
    </div>
  )
}

export function TourTabs({ tour }: TourTabsProps) {
  const t = useTranslations('tours')
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState('overview')

  const TABS = [
    { id: 'overview', label: t('tabs.overview') },
    { id: 'itinerary', label: t('tabs.itinerary') },
    { id: 'inclusions', label: t('tabs.inclusions') },
    { id: 'hotels', label: t('tabs.hotels') },
    { id: 'map', label: t('tabs.map') },
    { id: 'reviews', label: t('tabs.reviews') },
  ]

  return (
    <div>
      <div className="border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative py-4 px-4 text-sm font-bold whitespace-nowrap transition-colors',
                  isActive ? 'text-brand-blue' : 'text-gray-500 hover:text-brand-navy',
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewPanel tour={tour} />}
          {activeTab === 'itinerary' && <Itinerary itinerary={getTourItinerary(tour, locale)} />}
          {activeTab === 'inclusions' && <Inclusions includes={getTourArray(tour, 'includes', locale)} excludes={getTourArray(tour, 'excludes', locale)} />}
          {activeTab === 'hotels' && <HotelsPanel tour={tour} />}
          {activeTab === 'map' && <MapPanel tour={tour} />}
          {activeTab === 'reviews' && <ReviewsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
