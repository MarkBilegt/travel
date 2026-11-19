'use client'

import { useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { MONGOLIA_REGIONS } from '@/lib/constants'
import { ACTIVITIES, TOUR_TYPES, MONTHS } from '@/lib/tour-options'
import { INTL_LOCALE, toLocale } from '@/i18n/locales'

export interface FilterState {
  region: string
  season: string
  duration: string
  type: string
  activity: string
  difficulty: string
  price: string
  category: string
}

export const DEFAULT_FILTERS: FilterState = {
  region: 'all', season: 'all', duration: 'all', type: 'all', activity: 'all', difficulty: 'all', price: 'all', category: 'all',
}

interface TourFiltersProps {
  filters: FilterState
  onChange: (key: keyof FilterState, value: string) => void
}

interface SelectFieldProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (val: string) => void
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg',
            'px-4 py-2.5 pr-9 text-sm font-semibold text-brand-navy',
            'focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue',
            'cursor-pointer',
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

export function TourFilters({ filters, onChange }: TourFiltersProps) {
  const t = useTranslations('tours')
  const tf = useTranslations('tours.filters')
  const locale = useLocale()
  const [more, setMore] = useState(false)

  const monthName = (m: number) =>
    new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { month: 'long' }).format(new Date(2000, m - 1, 1))

  const REGIONS = [
    { value: 'all', label: tf('allDestinations') },
    ...MONGOLIA_REGIONS.map((r) => ({ value: r.key, label: t(`regionLabels.${r.key}` as Parameters<typeof t>[0]) })),
  ]

  const SEASONS = [
    { value: 'all', label: tf('allSeasons') },
    ...MONTHS.map((m) => ({ value: String(m), label: monthName(m) })),
  ]

  const DURATIONS = [
    { value: 'all', label: tf('allDurations') },
    { value: '1-5', label: tf('duration1to5') },
    { value: '6-10', label: tf('duration6to10') },
    { value: '11+', label: tf('duration11plus') },
  ]

  const TYPES = [
    { value: 'all', label: tf('allTypes') },
    ...TOUR_TYPES.filter((x) => x.key !== 'both').map((x) => ({ value: x.key, label: t(`typeLabels.${x.key}` as Parameters<typeof t>[0]) })),
  ]

  const ACTIVITY_OPTIONS = [
    { value: 'all', label: tf('allActivities') },
    ...ACTIVITIES.map((a) => ({ value: a.key, label: t(`activities.${a.key}` as Parameters<typeof t>[0]) })),
  ]

  const DIFFICULTIES = [
    { value: 'all', label: tf('allDifficulties') },
    { value: 'easy', label: t('difficulty.easy') },
    { value: 'moderate', label: t('difficulty.moderate') },
    { value: 'challenging', label: t('difficulty.challenging') },
  ]

  const PRICES = [
    { value: 'all', label: tf('allPrices') },
    { value: '0-1000', label: tf('priceLow') },
    { value: '1000-2000', label: tf('priceMid') },
    { value: '2000+', label: tf('priceHigh') },
  ]

  const CATEGORIES = [
    { value: 'all', label: tf('allCategories') },
    { value: 'adventure', label: t('categories.adventure') },
    { value: 'cultural', label: t('categories.cultural') },
    { value: 'nature', label: t('categories.nature') },
    { value: 'luxury', label: t('categories.luxury') },
    { value: 'family', label: t('categories.family') },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-brand-navy/10 p-5 border border-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SelectField label={tf('destination')} value={filters.region} options={REGIONS} onChange={(v) => onChange('region', v)} />
        <SelectField label={tf('season')} value={filters.season} options={SEASONS} onChange={(v) => onChange('season', v)} />
        <SelectField label={tf('duration')} value={filters.duration} options={DURATIONS} onChange={(v) => onChange('duration', v)} />
        <SelectField label={tf('type')} value={filters.type} options={TYPES} onChange={(v) => onChange('type', v)} />
      </div>

      <button
        type="button"
        onClick={() => setMore((m) => !m)}
        aria-expanded={more}
        className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy/70 hover:text-brand-navy"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        {more ? tf('fewerFilters') : tf('moreFilters')}
      </button>

      {more && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <SelectField label={tf('activity')} value={filters.activity} options={ACTIVITY_OPTIONS} onChange={(v) => onChange('activity', v)} />
          <SelectField label={tf('difficulty')} value={filters.difficulty} options={DIFFICULTIES} onChange={(v) => onChange('difficulty', v)} />
          <SelectField label={tf('price')} value={filters.price} options={PRICES} onChange={(v) => onChange('price', v)} />
          <SelectField label={tf('category')} value={filters.category} options={CATEGORIES} onChange={(v) => onChange('category', v)} />
        </div>
      )}
    </div>
  )
}
