'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { INTL_LOCALE, toLocale } from '@/i18n/locales'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { TourFilters, DEFAULT_FILTERS } from './TourFilters'
import { CategoryTabs } from './CategoryTabs'
import { TourGrid } from './TourGrid'
import { FeaturedBanner } from './FeaturedBanner'
import { PageHero } from '@/components/ui/PageHero'
import { fromPrice } from '@/lib/tour-pricing'
import type { Tour } from '@/types'
import type { FilterState } from './TourFilters'

// Fallback hero photo when there is no featured tour yet.
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1711127016876-9a1b7e05126f?w=2000&q=80&auto=format&fit=crop'

const PAGE_SIZE = 9
const PAGE_INCREMENT = 6

function matchesDuration(duration: number, range: string): boolean {
  if (range === 'all') return true
  if (range === '1-5') return duration >= 1 && duration <= 5
  if (range === '6-10') return duration >= 6 && duration <= 10
  if (range === '11+') return duration >= 11
  return true
}

function matchesPrice(price: number | null, range: string): boolean {
  if (range === 'all') return true
  if (price === null) return false
  if (range === '0-1000') return price <= 1000
  if (range === '1000-2000') return price > 1000 && price <= 2000
  if (range === '2000+') return price > 2000
  return true
}

export function ToursPageContent({ tours: initialTours = [] }: { tours?: Tour[] }) {
  const t = useTranslations('tours')
  const tf = useTranslations('tours.filters')
  const locale = useLocale()
  const TOURS = initialTours
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [filters, setFilters] = useState<FilterState>(() => {
    const initial = { ...DEFAULT_FILTERS }
    for (const key of Object.keys(initial) as (keyof FilterState)[]) initial[key] = searchParams.get(key) ?? 'all'
    return initial
  })
  const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'default')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [activeRegion, setActiveRegion] = useState(searchParams.get('region') ?? 'all')

  const SORT_OPTIONS = [
    { value: 'default', label: t('sort.default') },
    { value: 'price_asc', label: t('sort.priceAsc') },
    { value: 'price_desc', label: t('sort.priceDesc') },
    { value: 'duration_asc', label: t('sort.durationAsc') },
    { value: 'duration_desc', label: t('sort.durationDesc') },
  ]

  // Translated filter pill labels
  const regionLabels = t.raw('regionLabels') as Record<string, string>
  function getFilterPillLabel(key: keyof FilterState, value: string): string {
    if (key === 'region') return regionLabels[value] ?? value
    if (key === 'duration') {
      const map: Record<string, string> = {
        '1-5': tf('durationPill_1-5'),
        '6-10': tf('durationPill_6-10'),
        '11+': tf('durationPill_11+'),
      }
      return map[value] ?? value
    }
    if (key === 'price') {
      const map: Record<string, string> = {
        '0-1000': tf('pricePill_0-1000'),
        '1000-2000': tf('pricePill_1000-2000'),
        '2000+': tf('pricePill_2000+'),
      }
      return map[value] ?? value
    }
    if (key === 'category') return t(`categories.${value}` as Parameters<typeof t>[0]) ?? value
    if (key === 'activity') return t(`activities.${value}` as Parameters<typeof t>[0]) ?? value
    if (key === 'type') return t(`typeLabels.${value}` as Parameters<typeof t>[0]) ?? value
    if (key === 'difficulty') return t(`difficulty.${value}` as Parameters<typeof t>[0]) ?? value
    if (key === 'season') return new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { month: 'long' }).format(new Date(2000, Number(value) - 1, 1))
    return value
  }

  function updateFilter(key: keyof FilterState, value: string) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    setVisibleCount(PAGE_SIZE)

    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleRegionTab(region: string) {
    setActiveRegion(region)
    updateFilter('region', region)
  }

  function clearFilter(key: keyof FilterState) {
    updateFilter(key, 'all')
    if (key === 'region') setActiveRegion('all')
  }

  const filteredTours = useMemo(() => {
    let result = TOURS.filter((t) => t.active)
    if (filters.region !== 'all') result = result.filter((t) => t.regions.includes(filters.region))
    if (filters.season !== 'all') {
      const month = Number(filters.season)
      result = result.filter((t) => t.seasonMonths.length === 0 || t.seasonMonths.includes(month))
    }
    if (filters.type !== 'all') result = result.filter((t) => t.tourType === 'both' || t.tourType === filters.type)
    if (filters.activity !== 'all') result = result.filter((t) => t.activities.includes(filters.activity as Tour['activities'][number]))
    if (filters.difficulty !== 'all') result = result.filter((t) => t.difficulty === filters.difficulty)
    if (filters.duration !== 'all') result = result.filter((t) => matchesDuration(t.duration, filters.duration))
    if (filters.price !== 'all') result = result.filter((t) => matchesPrice(fromPrice(t), filters.price))
    if (filters.category !== 'all') result = result.filter((t) => t.category === filters.category)

    const sorted = [...result]
    const priceOf = (x: Tour) => fromPrice(x) ?? Number.MAX_SAFE_INTEGER
    if (sortBy === 'price_asc') sorted.sort((a, b) => priceOf(a) - priceOf(b))
    else if (sortBy === 'price_desc') sorted.sort((a, b) => priceOf(b) - priceOf(a))
    else if (sortBy === 'duration_asc') sorted.sort((a, b) => a.duration - b.duration)
    else if (sortBy === 'duration_desc') sorted.sort((a, b) => b.duration - a.duration)
    return sorted
  }, [filters, sortBy, TOURS])

  const visibleTours = filteredTours.slice(0, visibleCount)
  const hasMore = visibleCount < filteredTours.length

  // Category tabs - by region
  const allRegions = Array.from(
    new Set(TOURS.filter((t) => t.active).flatMap((t) => t.regions))
  )
  const regionTabs = [
    { value: 'all', label: tf('allRegions'), count: TOURS.filter((t) => t.active).length },
    ...allRegions.map((c) => ({
      value: c,
      label: regionLabels[c] ?? c,
      count: TOURS.filter((t) => t.active && t.regions.includes(c)).length,
    })),
  ]

  const activeFilters = (Object.entries(filters) as [keyof FilterState, string][]).filter(
    ([, v]) => v !== 'all'
  )

  const featuredTour = TOURS.find((t) => t.featured) ?? TOURS[0]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <PageHero
        eyebrow={t('heroLabel')}
        title={[t('heroTitle1')]}
        accent={t('heroTitle2')}
        image={featuredTour?.coverImage || HERO_FALLBACK}
        className="md:pb-12"
      />

      {/* Filter bar - floats over hero on md+, stacked below on mobile */}
      <div className="relative z-20 px-4 lg:px-8 md:-translate-y-1/2">
        <div className="mx-auto max-w-6xl pt-6 md:pt-0">
          <TourFilters filters={filters} onChange={updateFilter} />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 md:pt-24 pt-6 pb-16">

        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <p className="font-bold text-brand-navy text-lg">
            <span className="font-display text-2xl text-brand-gold-deep">{filteredTours.length}</span>{' '}
            {t('resultsCount', { count: filteredTours.length }).replace(`${filteredTours.length} `, '')}
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setVisibleCount(PAGE_SIZE) }}
              className="cursor-pointer rounded-full border border-brand-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy focus:border-brand-gold focus:outline-none focus:ring-4 focus:ring-brand-gold/15"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter pills */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {activeFilters.map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => clearFilter(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold',
                    'border border-brand-navy/15 bg-brand-cream text-brand-navy',
                    'transition-colors hover:border-brand-navy',
                  )}
                >
                  {getFilterPillLabel(key, value)}
                  <X className="w-3 h-3" />
                </button>
              ))}
              <button
                onClick={() => {
                  setFilters({ ...DEFAULT_FILTERS })
                  setActiveRegion('all')
                  router.replace(pathname, { scroll: false })
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors px-2"
              >
                {t('clearAllFilters')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category tabs */}
        <div className="mb-8">
          <CategoryTabs tabs={regionTabs} active={activeRegion} onChange={handleRegionTab} />
        </div>

        {/* Tour grid */}
        {visibleTours.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="mb-3 font-display text-3xl font-semibold uppercase text-brand-navy">{t('emptyTitle')}</p>
            <p className="text-gray-400 text-sm mb-6">{t('emptyDescription')}</p>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setFilters({ ...DEFAULT_FILTERS })
                setActiveRegion('all')
                router.replace(pathname, { scroll: false })
              }}
            >
              {t('clearFilters')}
            </Button>
          </div>
        ) : (
          <TourGrid tours={visibleTours} />
        )}

        {/* Load more */}
        {visibleTours.length > 0 && hasMore && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((p) => p + PAGE_INCREMENT)}
            >
              {t('loadMore', { remaining: filteredTours.length - visibleCount })}
            </Button>
          </div>
        )}
      </div>

      {featuredTour && <FeaturedBanner tour={featuredTour} />}
    </div>
  )
}
