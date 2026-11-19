'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MapPin, Utensils, Bed } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { ItineraryDay } from '@/types'

interface ItineraryProps {
  itinerary: ItineraryDay[]
}

export function Itinerary({ itinerary }: ItineraryProps) {
  const t = useTranslations('tours')
  const regionLabels = t.raw('regionLabels') as Record<string, string>
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([0]))

  const toggle = (idx: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {itinerary.map((day, idx) => {
        const isOpen = openDays.has(idx)
        return (
          <div key={day.day} className="flex gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0',
                  isOpen ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-500',
                )}
              >
                {day.day}
              </div>
              {idx < itinerary.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left py-2"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-0.5">
                    {t('itineraryDay', { day: day.day })}
                  </p>
                  <h4 className="font-black text-brand-navy text-base">{day.title}</h4>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4 space-y-3">
                      {day.image && (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                          <Image
                            src={day.image}
                            alt={`${t('itineraryDay', { day: day.day })}: ${day.title}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                        </div>
                      )}
                      <p className="text-gray-600 text-sm leading-relaxed">{day.description}</p>

                      <div className="flex flex-wrap gap-4">
                        {(day.overnight || day.accommodation) && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Bed className="w-3.5 h-3.5 text-brand-blue" />
                            {t('overnight', {
                              where: [
                                day.overnight ? t(`accommodationLabels.${day.overnight}` as Parameters<typeof t>[0]) : '',
                                day.accommodation ?? '',
                              ].filter(Boolean).join(' · '),
                            })}
                          </span>
                        )}
                        {day.meals && day.meals.length > 0 && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Utensils className="w-3.5 h-3.5 text-brand-gold" />
                            {day.meals.join(', ')}
                          </span>
                        )}
                        {day.region && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
                            {regionLabels[day.region] ?? day.region}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}
